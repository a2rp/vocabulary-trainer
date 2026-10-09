import { useEffect, useState } from "react";
import styles from "./App.module.css";
import SiteHeader from "./components/siteHeader";
import SiteFooter from "./components/siteFooter";
import BackToTop from "./components/backToTop";
import VocabularyTrainer from "./components/vocabularyTrainer";

const App = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);
    useEffect(() => {
        const onScroll = () => setShowBackToTop(window.scrollY > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (
        <div className={styles["app-shell"]} id="top">
            <SiteHeader title="Wordwell" mark="W" navItems={[["Practice", "#dashboard"], ["Word list", "#workspace"]]} repoUrl="https://github.com/a2rp/vocabulary-trainer" />
            <main className={styles.pageContent}>
                <VocabularyTrainer />
            </main>
            <SiteFooter repoUrl="https://github.com/a2rp/vocabulary-trainer" />
            <BackToTop visible={showBackToTop} />
        </div>
    );
};

export default App;
