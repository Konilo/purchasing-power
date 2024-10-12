import os
import sys
import datetime
from typing_extensions import Annotated
from fastapi import Depends, APIRouter, Query
import polars as pl
from dateutil.relativedelta import relativedelta

# Allow imports from the parent directory
dir_abspath = os.path.dirname(__file__)
parent_dir_abspath = os.path.dirname(dir_abspath)
sys.path.append(parent_dir_abspath)

from shared.environments_utils import load_env_from_dir
from .common import Common

# Load the .env of the current service of the monorepo
load_env_from_dir(dir_abspath)


START_DATE = datetime.date(2000, 1, 1)
START_ASSET_PRICE = 1
START_CPI_VALUE = 100


# recurring_investment_amount is not concerned by inflation correction: it's a
# fixed currency amount (fixed by the investor), even though its purchasing
# power will change -- the DCA amount is not meant to change with inflation in
# this simulation tool


class PersonalFinanceProject:
    def __init__(
        self,
        initial_amount_invested,
        recurring_investment_frequency,
        recurring_investment_amount,
        investment_duration_yrs,
        annual_gross_yield,
        annual_inflation_rate,
        investment_buy_in_fee_pct,
        annual_custody_fee_pct,
        investment_sell_out_fee_pct,
        tax_on_gains_pct,
        currency,
    ):
        self.initial_amount_invested = initial_amount_invested
        self.recurring_investment_frequency = recurring_investment_frequency
        self.recurring_investment_amount = recurring_investment_amount
        self.investment_duration_yrs = investment_duration_yrs
        self.annual_gross_yield = annual_gross_yield
        self.annual_inflation_rate = annual_inflation_rate
        self.investment_buy_in_fee_pct = investment_buy_in_fee_pct
        self.annual_custody_fee_pct = annual_custody_fee_pct
        self.investment_sell_out_fee_pct = investment_sell_out_fee_pct
        self.tax_on_gains_pct = tax_on_gains_pct
        self.currency = currency

        self.closing_prices = self.project_closing_prices()
        self.transactions = self.project_transactions()
        self.final_cpi_value, self.inflation_correction_factor = (
            self.project_inflation()
        )

        self.summary = self.summarize_projection_results()
        self.details = self.detail_projection_results()

    def get_daily_closing_price(self, date, price_start_year):
        n_days_in_year = (
            datetime.date(date.year, 12, 31) - datetime.date(date.year, 1, 1)
        ).days
        n_days_ytd = (date - datetime.date(date.year, 1, 1)).days
        closing_price = price_start_year * (
            1 + self.annual_gross_yield / 100 * n_days_ytd / n_days_in_year
        )
        return closing_price

    def project_closing_prices(self):
        closing_prices = pl.DataFrame()
        closing_prices = closing_prices.with_columns(
            date=pl.date_range(
                start=START_DATE,
                end=START_DATE
                + relativedelta(years=self.investment_duration_yrs)
                - relativedelta(days=1),
                interval="1d",
            ),
        )

        closing_prices = closing_prices.with_columns(
            price_start_year=START_ASSET_PRICE
            * (1 + self.annual_gross_yield / 100)
            ** (pl.col("date").dt.year() - START_DATE.year),
        )

        closing_prices = closing_prices.hstack(
            pl.DataFrame(
                {
                    "price": [
                        self.get_daily_closing_price(
                            row["date"], row["price_start_year"]
                        )
                        for row in closing_prices.to_dicts()
                    ],
                }
            )
        )

        return closing_prices

    def project_transactions_buy_ins(self):
        # Buy-ins
        transactions = pl.DataFrame(
            {
                "date": [START_DATE],
                "spending": [self.initial_amount_invested],
            }
        )

        if self.recurring_investment_frequency == "weekly":
            recurring_investment_dates = [
                START_DATE + datetime.timedelta(weeks=i)
                for i in range(1, self.investment_duration_yrs * 52)
            ]
        elif self.recurring_investment_frequency == "monthly":
            recurring_investment_dates = [
                START_DATE + relativedelta(months=i)
                for i in range(0, self.investment_duration_yrs * 12)
            ]
        elif self.recurring_investment_frequency == "annual":
            recurring_investment_dates = [
                START_DATE + relativedelta(years=i)
                for i in range(0, self.investment_duration_yrs)
            ]

        transactions = transactions.vstack(
            pl.DataFrame(
                {
                    "date": recurring_investment_dates,
                    "spending": [self.recurring_investment_amount]
                    * len(recurring_investment_dates),
                }
            ),
        )

        transactions = transactions.with_columns(
            buy_in_fee=pl.col("spending")
            * self.investment_buy_in_fee_pct
            / 100,
        )

        transactions = transactions.with_columns(
            spending_on_asset=pl.col("spending") - pl.col("buy_in_fee"),
        )

        transactions = transactions.join(
            self.closing_prices.select(
                pl.col("date"), pl.col("price").alias("buy_price")
            ),
            on="date",
        )

        transactions = transactions.with_columns(
            n_assets_acquired=pl.col("spending_on_asset") / pl.col("buy_price"),
        )

        return transactions

    def project_transactions_custodian_fees(self, transactions):
        ## Annual custodian fees
        transactions = transactions.with_columns(total_custodian_fee=0)
        for year in range(
            START_DATE.year,
            (
                START_DATE + relativedelta(years=self.investment_duration_yrs)
            ).year,
        ):
            closing_price_year = (
                self.closing_prices.filter(
                    pl.col("date") == datetime.date(year, 12, 31)
                )
                .select("price")
                .item()
            )

            transactions = transactions.with_columns(
                total_custodian_fee=pl.when(
                    pl.col("date").dt.year() <= year,
                )
                .then(
                    pl.col("total_custodian_fee")
                    + pl.col("n_assets_acquired")
                    * closing_price_year
                    * self.annual_custody_fee_pct
                    / 100,
                )
                .otherwise(
                    pl.col("total_custodian_fee"),
                ),
            )

            return transactions

    def project_transactions_sell_outs(self, transactions):
        # Sell outs
        transactions = transactions.with_columns(
            sell_price=self.closing_prices.filter(
                pl.col("date")
                == START_DATE
                + relativedelta(years=self.investment_duration_yrs)
                - relativedelta(days=1),
            ).select("price")
        )

        transactions = transactions.with_columns(
            gross_final_value=pl.col("n_assets_acquired")
            * pl.col("sell_price"),
        )

        transactions = transactions.with_columns(
            gross_final_gain=pl.col("gross_final_value") - pl.col("spending"),
        )

        transactions = transactions.with_columns(
            sell_out_fee=pl.col("gross_final_value")
            * self.investment_sell_out_fee_pct
            / 100,
        )

        transactions = transactions.with_columns(
            net_pre_tax_final_value=pl.col("gross_final_value")
            - pl.col("sell_out_fee")
            - pl.col("total_custodian_fee"),
        )

        transactions = transactions.with_columns(
            # gain is computed using spending and not spending_on_asset because
            # that's the French fisc method
            net_pre_tax_final_gain=pl.col("net_pre_tax_final_value")
            - pl.col("spending"),
        )

        transactions = transactions.with_columns(
            tax_on_gains=pl.when(pl.col("net_pre_tax_final_gain") < 0)
            .then(0)
            .otherwise(
                pl.col("net_pre_tax_final_gain") * self.tax_on_gains_pct / 100,
            ),
        )

        transactions = transactions.with_columns(
            net_post_tax_final_gain=pl.col("net_pre_tax_final_gain")
            - pl.col("tax_on_gains"),
            net_post_tax_final_value=pl.col("net_pre_tax_final_value")
            - pl.col("tax_on_gains"),
        )

        return transactions

    def project_transactions(self):
        transactions = self.project_transactions_buy_ins()
        transactions = self.project_transactions_custodian_fees(transactions)
        transactions = self.project_transactions_sell_outs(transactions)
        return transactions

    def project_inflation(self):
        # Inflation correction factor
        final_cpi_value = START_CPI_VALUE * (
            1 + self.annual_inflation_rate / 100
        ) ** len(
            range(
                START_DATE.year,
                (
                    START_DATE
                    + relativedelta(years=self.investment_duration_yrs)
                ).year,
            )
        )
        inflation_correction_factor = START_CPI_VALUE / final_cpi_value
        return final_cpi_value, inflation_correction_factor

    def summarize_projection_results(self):
        return {
            # amount spent
            "total_spending": round(self.transactions["spending"].sum(), 2),
            # net_post_tax_final_value
            "net_post_tax_final_value": round(
                self.transactions["net_post_tax_final_value"].sum(), 2
            ),
            "net_post_tax_inflation_corrected_final_value": round(
                self.transactions["net_post_tax_final_value"].sum()
                * self.inflation_correction_factor,
                2,
            ),
            # net_post_tax_final_gain
            "net_post_tax_final_gain": round(
                self.transactions["net_post_tax_final_gain"].sum(), 2
            ),
            "net_post_tax_inflation_corrected_final_gain": round(
                self.transactions["net_post_tax_final_gain"].sum()
                * self.inflation_correction_factor,
                2,
            ),
            # total_inflation_pct
            "total_inflation_pct": round(
                (self.final_cpi_value - START_CPI_VALUE)
                / START_CPI_VALUE
                * 100,
                2,
            ),
            # net_post_tax_yield
            "net_post_tax_yield": round(
                self.transactions["net_post_tax_final_gain"].sum()
                / self.transactions["spending"].sum()
                * 100,
                2,
            ),
            "net_post_tax_inflation_corrected_yield": round(
                self.transactions["net_post_tax_final_gain"].sum()
                * self.inflation_correction_factor
                / self.transactions["spending"].sum()
                * 100,
                2,
            ),
            # currency
            "currency": self.currency,
        }

    def detail_projection_results(self):
        return {
            # spending
            "initial_amount_invested": round(self.initial_amount_invested, 2),
            "recurring_investment_frequency": self.recurring_investment_frequency,
            "recurring_investment_amount": round(
                self.recurring_investment_amount, 2
            ),
            "total_spending": round(self.transactions["spending"].sum(), 2),
            # buy in fees
            "buy_in_fees": round(self.transactions["buy_in_fee"].sum(), 2),
            # annual yield
            "annual_gross_yield": round(self.annual_gross_yield, 2),
            # annual custodian fee
            "total_custodian_fees": round(
                self.transactions["total_custodian_fee"].sum(), 2
            ),
            # sell out fees
            "sell_out_fees": round(self.transactions["sell_out_fee"].sum(), 2),
            "inflation_corrected_sell_out_fees": round(
                self.transactions["sell_out_fee"].sum()
                * self.inflation_correction_factor,
                2,
            ),
            # net_pre_tax_final_value
            "net_pre_tax_final_value": round(
                self.transactions["net_pre_tax_final_value"].sum(), 2
            ),
            "net_pre_tax_inflation_corrected_final_value": round(
                self.transactions["net_pre_tax_final_value"].sum()
                * self.inflation_correction_factor,
                2,
            ),
            # net_pre_tax_final_gain
            "net_pre_tax_final_gain": round(
                self.transactions["net_pre_tax_final_gain"].sum(), 2
            ),
            "net_pre_tax_inflation_corrected_final_gain": round(
                self.transactions["net_pre_tax_final_gain"].sum()
                * self.inflation_correction_factor,
                2,
            ),
            # tax on gains
            "tax_on_gains": round(self.transactions["tax_on_gains"].sum(), 2),
            "inflation_corrected_tax_on_gains": round(
                self.transactions["tax_on_gains"].sum()
                * self.inflation_correction_factor,
                2,
            ),
            # net_post_tax_final_gain
            "net_post_tax_final_gain": round(
                self.transactions["net_post_tax_final_gain"].sum(), 2
            ),
            "net_post_tax_inflation_corrected_final_gain": round(
                self.transactions["net_post_tax_final_gain"].sum()
                * self.inflation_correction_factor,
                2,
            ),
            # net_post_tax_final_value
            "net_post_tax_final_value": round(
                self.transactions["net_post_tax_final_value"].sum(), 2
            ),
            "net_post_tax_inflation_corrected_final_value": round(
                self.transactions["net_post_tax_final_value"].sum()
                * self.inflation_correction_factor,
                2,
            ),
            # currency
            "currency": self.currency,
        }


router = APIRouter()


@router.get("/project_personal_finances")
async def project_personal_finances(
    common: Annotated[Common, Depends()],
    initial_amount_invested: Annotated[int, Query(ge=0)],
    recurring_investment_frequency: Annotated[
        str, Query(pattern="^(weekly|monthly|annual)$")
    ],
    recurring_investment_amount: Annotated[int, Query(ge=0)],
    investment_duration_yrs: Annotated[int, Query(gt=0)],
    annual_gross_yield: float,
    annual_inflation_rate: float,
    investment_buy_in_fee_pct: Annotated[float, Query(ge=0, le=100)],
    annual_custody_fee_pct: Annotated[float, Query(ge=0, le=100)],
    investment_sell_out_fee_pct: Annotated[float, Query(ge=0, le=100)],
    tax_on_gains_pct: Annotated[float, Query(ge=0, le=100)],
    currency: str,
) -> dict:
    project = PersonalFinanceProject(
        initial_amount_invested,
        recurring_investment_frequency,
        recurring_investment_amount,
        investment_duration_yrs,
        annual_gross_yield,
        annual_inflation_rate,
        investment_buy_in_fee_pct,
        annual_custody_fee_pct,
        investment_sell_out_fee_pct,
        tax_on_gains_pct,
        currency,
    )

    return {
        "summary": project.summary,
        "details": project.details,
    }
