import { FaGithub } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import styles from "./styles.module.css";

const SiteHeader = ({ title, mark, navItems, repoUrl }) => (
    <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
            <a className={styles.brand} href="#top" aria-label={`${title} home`}>
                <span className={styles.brandMark} aria-hidden="true">{mark}</span>
                <span>{title}</span>
            </a>
            <nav className={styles.navigation} aria-label="Main navigation">
                {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
            </nav>
            <a className={styles.repositoryLink} href={repoUrl} target="_blank" rel="noreferrer">
                <FaGithub aria-hidden="true" /><span>Repository</span><FiArrowUpRight aria-hidden="true" />
            </a>
        </div>
    </header>
);

export default SiteHeader;
