import { Link } from "react-router-dom";
import "./styles/Sidebar.css";
import GitHubLogo from "./assets/github-mark-white.svg";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h1>Purchasing Power</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">About</Link>
          </li>
          <li>
            <Link to="/basics">Basics</Link>
          </li>
          <li>
            <Link to="/personal_finance">Personal Finance</Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-bottom-item">
        <a
          href="https://github.com/Konilo/purchasing-power/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={GitHubLogo} alt="GitHub logo" />
        </a>
      </div>
    </div>
  );
}
