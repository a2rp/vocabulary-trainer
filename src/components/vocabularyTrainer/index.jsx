import { useMemo, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCheck, FiEye, FiPlus } from "react-icons/fi";

import styles from "./styles.module.css";

const STARTER_WORDS = [
    {
        id: "1",
        word: "Ephemeral",
        type: "adjective",
        definition: "Lasting for a very short time.",
    },
    {
        id: "2",
        word: "Pragmatic",
        type: "adjective",
        definition: "Dealing with things sensibly and realistically.",
    },
    {
        id: "3",
        word: "Luminous",
        type: "adjective",
        definition: "Full of or shedding light; bright or shining.",
    },
    {
        id: "4",
        word: "Resilient",
        type: "adjective",
        definition: "Able to recover quickly from difficulty.",
    },
    {
        id: "5",
        word: "Nuance",
        type: "noun",
        definition: "A subtle difference in meaning, expression, or sound.",
    },
];

const WORDS_STORAGE_KEY = "wordwell-list";
const KNOWN_STORAGE_KEY = "wordwell-known";
const WORD_LIMIT = 500;

const normalizeWord = (item) => {
    if (!item || typeof item !== "object") {
        return null;
    }

    const word = typeof item.word === "string" ? item.word.trim() : "";
    const definition =
        typeof item.definition === "string" ? item.definition.trim() : "";

    if (!word || !definition) {
        return null;
    }

    return {
        id:
            typeof item.id === "string" && item.id.trim()
                ? item.id.trim()
                : createWordId(),
        word,
        type:
            typeof item.type === "string" && item.type.trim()
                ? item.type.trim()
                : "word",
        definition,
    };
};

const createWordId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const loadWords = () => {
    try {
        const storedWords = localStorage.getItem(WORDS_STORAGE_KEY);

        if (storedWords === null) {
            return STARTER_WORDS;
        }

        const parsedWords = JSON.parse(storedWords);

        if (!Array.isArray(parsedWords)) {
            return STARTER_WORDS;
        }

        return parsedWords
            .map(normalizeWord)
            .filter(Boolean)
            .slice(0, WORD_LIMIT);
    } catch {
        return STARTER_WORDS;
    }
};

const loadKnownWords = (wordList) => {
    try {
        const parsedKnown = JSON.parse(
            localStorage.getItem(KNOWN_STORAGE_KEY) || "[]",
        );

        if (!Array.isArray(parsedKnown)) {
            return [];
        }

        const validIds = new Set(wordList.map((item) => item.id));

        return [...new Set(parsedKnown)].filter(
            (id) => typeof id === "string" && validIds.has(id),
        );
    } catch {
        return [];
    }
};

const persist = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));

        return true;
    } catch {
        return false;
    }
};

const normalizeDefinition = (value) =>
    value
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

const VocabularyTrainer = () => {
    const [list, setList] = useState(loadWords);
    const [known, setKnown] = useState(() => loadKnownWords(list));
    const [storageError, setStorageError] = useState(false);
    const [index, setIndex] = useState(0);
    const [filter, setFilter] = useState("All words");
    const [show, setShow] = useState(false);
    const [guess, setGuess] = useState("");
    const [feedback, setFeedback] = useState("");
    const [newWord, setNewWord] = useState("");
    const [definition, setDefinition] = useState("");
    const [formMessage, setFormMessage] = useState("");

    const filtered = useMemo(
        () =>
            list.filter((item) =>
                filter === "All words"
                    ? true
                    : filter === "To learn"
                      ? !known.includes(item.id)
                      : known.includes(item.id),
            ),
        [list, filter, known],
    );

    const current = filtered.length
        ? filtered[index % filtered.length]
        : null;

    const saveList = (nextList) => {
        setList(nextList);
        setStorageError(!persist(WORDS_STORAGE_KEY, nextList));
    };

    const saveKnown = (nextKnown) => {
        setKnown(nextKnown);
        setStorageError(!persist(KNOWN_STORAGE_KEY, nextKnown));
    };

    const resetAnswer = () => {
        setShow(false);
        setGuess("");
        setFeedback("");
    };

    const move = (step) => {
        const length = Math.max(filtered.length, 1);

        setIndex((value) => (value + step + length) % length);
        resetAnswer();
    };

    const selectFilter = (nextFilter) => {
        setFilter(nextFilter);
        setIndex(0);
        resetAnswer();
    };

    const selectWord = (wordIndex) => {
        setIndex(wordIndex);
        resetAnswer();
    };

    const check = (event) => {
        event.preventDefault();

        if (!current) {
            return;
        }

        if (!guess.trim()) {
            setShow(false);
            setFeedback("Write a guess first, or reveal the definition.");

            return;
        }

        const isCorrect =
            normalizeDefinition(guess) ===
            normalizeDefinition(current.definition);

        setFeedback(
            isCorrect
                ? "That's it! You remembered the meaning."
                : "The wording does not match. Review the definition, then decide if you know this word.",
        );
        setShow(true);
    };

    const add = (event) => {
        event.preventDefault();

        const nextWord = newWord.trim();
        const nextDefinition = definition.trim();

        if (!nextWord || !nextDefinition) {
            setFormMessage("Enter both a word and its meaning.");

            return;
        }

        if (
            list.some(
                (item) => item.word.toLocaleLowerCase() === nextWord.toLocaleLowerCase(),
            )
        ) {
            setFormMessage("That word is already in your list.");

            return;
        }

        if (list.length >= WORD_LIMIT) {
            setFormMessage(`Your list is limited to ${WORD_LIMIT} words.`);

            return;
        }

        const nextList = [
            {
                id: createWordId(),
                word: nextWord,
                type: "your word",
                definition: nextDefinition,
            },
            ...list,
        ];

        saveList(nextList);
        setNewWord("");
        setDefinition("");
        setFormMessage("");
        setFilter("All words");
        setIndex(0);
        resetAnswer();
    };

    const mark = () => {
        if (!current) {
            return;
        }

        const isKnown = known.includes(current.id);

        if (!isKnown) {
            saveKnown([...known, current.id]);
        }

        if (filter === "To learn" && !isKnown) {
            setIndex(Math.max(0, Math.min(index, filtered.length - 2)));
        } else {
            setIndex((index + 1) % Math.max(filtered.length, 1));
        }

        resetAnswer();
    };

    const knownCount = known.length;

    return (
        <section className={styles.vocabularyTrainer} id="dashboard">
            {storageError && (
                <p className={styles.storageWarning} role="status">
                    Your browser could not save this update. Check site storage
                    permissions before closing this page.
                </p>
            )}

            <header className={styles.header}>
                <div>
                    <p className={styles.label}>WORDWELL / DAILY PRACTICE</p>
                    <h1>Words open doors.</h1>
                    <p>Meet a new word, try its meaning, and keep what you learn.</p>
                </div>
                <div className={styles.total}>
                    <b>{knownCount}</b>
                    <span>words learned</span>
                </div>
            </header>

            <div className={styles.practice} id="workspace">
                <aside className={styles.wordRail}>
                    <p className={styles.label}>YOUR WORDS</p>
                    <div className={styles.filter} role="group" aria-label="Filter words">
                        {["All words", "To learn", "Mastered"].map((item) => (
                            <button
                                type="button"
                                key={item}
                                className={filter === item ? styles.active : ""}
                                aria-pressed={filter === item}
                                onClick={() => selectFilter(item)}
                            >
                                {item}
                                <span>
                                    {item === "All words"
                                        ? list.length
                                        : item === "To learn"
                                          ? list.length - knownCount
                                          : knownCount}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className={styles.wordList}>
                        {filtered.map((item, itemIndex) => (
                            <button
                                type="button"
                                key={item.id}
                                className={
                                    itemIndex === index % Math.max(filtered.length, 1)
                                        ? styles.currentWord
                                        : ""
                                }
                                aria-current={
                                    itemIndex === index % Math.max(filtered.length, 1)
                                        ? "true"
                                        : undefined
                                }
                                onClick={() => selectWord(itemIndex)}
                            >
                                <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                                {item.word}
                                {known.includes(item.id) && <FiCheck aria-hidden="true" />}
                            </button>
                        ))}
                    </div>
                </aside>

                <article className={styles.card}>
                    {current ? (
                        <>
                            <div className={styles.cardTop}>
                                <span>
                                    {String(index + 1).padStart(2, "0")} <i>/ {String(filtered.length).padStart(2, "0")}</i>
                                </span>
                                <span className={styles.wordType}>{current.type}</span>
                            </div>

                            <div className={styles.wordCenter}>
                                <p className={styles.hint}>WHAT DOES THIS WORD MEAN?</p>
                                <h2>{current.word}</h2>
                            </div>

                            <form className={styles.answer} onSubmit={check}>
                                <label htmlFor="definition-guess">
                                    Try to recall the stored definition
                                </label>
                                <input
                                    id="definition-guess"
                                    value={guess}
                                    onChange={(event) => {
                                        setGuess(event.target.value);
                                        setFeedback("");
                                    }}
                                    placeholder="Write what you remember"
                                    maxLength={300}
                                />
                                <div className={styles.answerActions}>
                                    <button type="submit">
                                        <FiEye aria-hidden="true" /> Check meaning
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShow(true);
                                            setFeedback("");
                                        }}
                                    >
                                        Reveal definition
                                    </button>
                                </div>
                                {!show && feedback && (
                                    <p className={styles.answerFeedback} role="status">
                                        {feedback}
                                    </p>
                                )}
                            </form>

                            {show && (
                                <div className={styles.definition}>
                                    <small>DEFINITION</small>
                                    <p>{current.definition}</p>
                                    {feedback && <span role="status">{feedback}</span>}
                                </div>
                            )}

                            <div className={styles.cardFoot}>
                                <button
                                    type="button"
                                    onClick={() => move(-1)}
                                    aria-label="Previous word"
                                >
                                    <FiArrowLeft aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    className={styles.mastered}
                                    onClick={mark}
                                >
                                    <FiCheck aria-hidden="true" />
                                    {known.includes(current.id)
                                        ? "Next word"
                                        : "I know this word"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => move(1)}
                                    aria-label="Next word"
                                >
                                    <FiArrowRight aria-hidden="true" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className={styles.empty}>
                            {list.length === 0
                                ? "No words in your list yet. Add one below."
                                : "No words match this filter. Choose another filter or add a word below."}
                        </div>
                    )}
                </article>
            </div>

            <form className={styles.addWord} onSubmit={add}>
                <div>
                    <p className={styles.label}>PERSONAL DICTIONARY</p>
                    <h2>Add a word</h2>
                </div>
                <label>
                    Word
                    <input
                        value={newWord}
                        onChange={(event) => {
                            setNewWord(event.target.value);
                            setFormMessage("");
                        }}
                        placeholder="New vocabulary"
                        maxLength={60}
                        required
                    />
                </label>
                <label>
                    Meaning
                    <input
                        value={definition}
                        onChange={(event) => {
                            setDefinition(event.target.value);
                            setFormMessage("");
                        }}
                        placeholder="Short definition"
                        maxLength={300}
                        required
                    />
                </label>
                <button type="submit">
                    <FiPlus aria-hidden="true" /> Add word
                </button>
                {formMessage && (
                    <p className={styles.formMessage} role="status">
                        {formMessage}
                    </p>
                )}
            </form>
        </section>
    );
};

export default VocabularyTrainer;
