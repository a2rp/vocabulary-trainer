import { FaGithub } from "react-icons/fa";
import styles from "./styles.module.css";

const links = [
    ["Portfolio", "https://www.ashishranjan.net"], ["GitHub", "https://github.com/a2rp"],
    ["CodePen", "https://codepen.io/ash1198"], ["LinkedIn", "https://www.linkedin.com/in/aashishranjan"],
    ["Facebook", "https://www.facebook.com/theash.ashish/"], ["YouTube", "https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1"],
    ["Email", "mailto:ash.ranjan09@gmail.com"], ["Support", "https://a2rp-donation-page.netlify.app/"],
    ["Buy Me a Coffee", "https://buymeacoffee.com/ashishranjan"], ["Patreon", "https://www.patreon.com/ashishranjan"],
];

const SiteFooter = ({ repoUrl }) => (
    <footer className={styles.siteFooter}>
        <div className={styles.footerInner}>
            <div className={styles.identity}>
                <a href="https://www.ashishranjan.net" aria-label="Visit Ashish Ranjan portfolio"><img src={`${import.meta.env.BASE_URL}logo.png`} alt="Ashish Ranjan logo" /></a>
                <span>{"\u00A9"} {new Date().getFullYear()} <a href="https://github.com/a2rp">Ashish Ranjan</a>. All rights reserved.</span>
            </div>
            <nav className={styles.footerLinks} aria-label="Source, social and support links">
                <a href={repoUrl} target="_blank" rel="noreferrer"><FaGithub aria-hidden="true" /> Source code</a>
                {links.map(([label, href]) => <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>{label}</a>)}
            </nav>
        </div>
    </footer>
);

export default SiteFooter;
