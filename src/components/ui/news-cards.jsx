"use client";

import { m, AnimatePresence, useReducedMotion, LayoutGroup } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { BookmarkIcon, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

function safeHref(link) {
  return /^https?:\/\//i.test(link || "") ? link : "";
}

export function NewsCards({
  title = "News Today",
  subtitle = "Stories from all over the world",
  statusBars = [],
  newsCards = [],
  enableAnimations = true,
  showHeader = true,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [bookmarkedCards, setBookmarkedCards] = useState(new Set());
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  const toggleBookmark = (cardId, e) => {
    e.stopPropagation();
    setBookmarkedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const openCard = (card) => {
    triggerRef.current = document.activeElement;
    setSelectedCard(card);
  };

  const closeCard = () => {
    setSelectedCard(null);
    triggerRef.current?.focus();
  };

  // Focus the close button on open, trap Tab inside the dialog, and let
  // Escape close it — mirrors StoryFeed's modal so keyboard users get the
  // same guarantees in both views.
  useEffect(() => {
    if (!selectedCard) return undefined;
    closeRef.current?.focus();
    const dialog = dialogRef.current;
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeCard();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const focusables = [
        ...dialog.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      ].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCard]);

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsLoaded(true);
    }
  }, [shouldAnimate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const headerVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 28,
        mass: 0.6,
      }
    }
  };

  const statusBarContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      }
    }
  };

  const statusBarVariants = {
    hidden: {
      opacity: 0,
      scaleX: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      scaleX: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        scaleX: { type: "spring", stiffness: 400, damping: 30 }
      }
    }
  };

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.8,
      }
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9,
      filter: "blur(6px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 28,
        mass: 0.8,
      }
    }
  };

  const imageVariants = {
    hidden: {
      scale: 1.1,
      opacity: 0.8,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.2,
      }
    }
  };

  return (
    <m.div
      className="w-full max-w-6xl mx-auto p-6 bg-background text-foreground"
      initial={shouldAnimate ? "hidden" : "visible"}
      animate={isLoaded ? "visible" : "hidden"}
      variants={shouldAnimate ? containerVariants : {}}
    >
      {showHeader ? (
        <m.div
          className="mb-8"
          variants={shouldAnimate ? headerVariants : {}}
        >
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground text-lg">{subtitle}</p>

          <m.div
            className="mt-6 space-y-1"
            variants={shouldAnimate ? statusBarContainerVariants : {}}
          >
            {statusBars.map((bar, index) => (
              <m.div
                key={bar.id}
                className={cn("h-0.5 bg-foreground rounded-full", bar.id === "1" ? "bg-foreground/80" : bar.id === "2" ? "bg-foreground/60" : "bg-foreground/40")}
                style={{
                  opacity: bar.opacity,
                  width: `${(bar.length / 3) * 100}%`
                }}
                variants={shouldAnimate ? statusBarVariants : {}}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 0.3 + (index * 0.1),
                  type: "spring",
                  stiffness: 400,
                  damping: 30
                }}
              />
            ))}
          </m.div>
        </m.div>
      ) : null}

      <LayoutGroup>
        <m.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
          variants={shouldAnimate ? cardContainerVariants : {}}
        >
          {newsCards.map((card, index) => {
            if (selectedCard?.id === card.id) {
              return null;
            }

            return (
              <m.article
                key={card.id}
                layoutId={`card-${card.id}`}
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-label={`Open story: ${card.title}`}
                className="bg-card border border-border/50 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                variants={shouldAnimate ? cardVariants : {}}
                whileHover={shouldAnimate ? {
                  y: -4,
                  scale: 1.01,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                } : {}}
                onClick={() => openCard(card)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openCard(card);
                  }
                }}
              >
                <m.div
                  layoutId={`card-image-${card.id}`}
                  className={cn(
                    "relative h-56 overflow-hidden bg-muted",
                    !card.image && "bg-foreground/5"
                  )}
                >
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover transform-gpu group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent"></div>
                  )}
                  {card.gradientColors && (
                    <div className={`absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t ${card.gradientColors[0]} ${card.gradientColors[1]} to-transparent`}></div>
                  )}

                  <m.div
                    className="absolute top-3 right-3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 400, damping: 25 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => toggleBookmark(card.id, e)}
                  >
                    <BookmarkIcon
                      className={`w-5 h-5 transition-colors cursor-pointer ${
                        bookmarkedCards.has(card.id)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-foreground/60 hover:text-foreground'
                      }`}
                    />
                  </m.div>

                  <m.div
                    className="absolute bottom-3 left-3 text-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="text-xs mb-1 opacity-90">
                      {card.category}, {card.subcategory}
                    </div>
                    <div className="text-xs opacity-75">
                      {card.timeAgo}
                      {card.location ? `, ${card.location}` : ""}
                    </div>
                  </m.div>
                </m.div>

                <m.div
                  layoutId={`card-content-${card.id}`}
                  className="p-6"
                >
                  <m.h3
                    layoutId={`card-title-${card.id}`}
                    className="font-semibold text-lg leading-tight line-clamp-3 group-hover:text-primary transition-colors"
                  >
                    {card.title}
                  </m.h3>
                </m.div>
              </m.article>
            );
          })}
        </m.div>

        <AnimatePresence>
          {selectedCard && (
            <>
              <m.div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeCard}
              />

              <m.div
                ref={dialogRef}
                layoutId={`card-${selectedCard.id}`}
                role="dialog"
                aria-modal="true"
                aria-label={selectedCard.title}
                className="fixed inset-4 md:inset-8 lg:inset-16 bg-card border border-border rounded-xl overflow-hidden z-50 focus:outline-none"
              >
                <m.button
                  ref={closeRef}
                  aria-label="Close story"
                  className="absolute top-4 right-4 w-8 h-8 bg-background/80 hover:bg-background rounded-full flex items-center justify-center z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeCard}
                >
                  <X className="w-4 h-4" />
                </m.button>

                <div className="h-full overflow-y-auto">
                  <m.div
                    layoutId={`card-image-${selectedCard.id}`}
                    className={cn(
                      "relative h-64 md:h-80",
                      !selectedCard.image && "bg-foreground/5"
                    )}
                  >
                    {selectedCard.image ? (
                      <img
                        src={selectedCard.image}
                        alt={selectedCard.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent"></div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/90 to-transparent"></div>
                    {selectedCard.gradientColors && (
                      <div className={`absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t ${selectedCard.gradientColors[0]} ${selectedCard.gradientColors[1]} to-transparent`}></div>
                    )}

                    <div className="absolute bottom-4 left-4 text-foreground">
                      <div className="text-sm mb-1 opacity-90">{selectedCard.category}, {selectedCard.subcategory}</div>
                      <div className="text-sm opacity-75">{selectedCard.timeAgo}{selectedCard.location ? `, ${selectedCard.location}` : ""}</div>
                    </div>
                  </m.div>

                  <m.div
                    layoutId={`card-content-${selectedCard.id}`}
                    className="p-6 md:p-8"
                  >
                    <m.h1
                      layoutId={`card-title-${selectedCard.id}`}
                      className="text-2xl md:text-3xl font-bold mb-6"
                    >
                      {selectedCard.title}
                    </m.h1>

                    <m.div
                      className="prose prose-lg max-w-none text-muted-foreground"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      {selectedCard.content?.length ? (
                        selectedCard.content.map((paragraph, index) => (
                          <p key={index} className="mb-4">
                            {paragraph}
                          </p>
                        ))
                      ) : (
                        <p className="mb-4">No summary available for this story.</p>
                      )}
                    </m.div>

                    {safeHref(selectedCard.link) ? (
                      <m.a
                        href={selectedCard.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                      >
                        Read original <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      </m.a>
                    ) : null}
                  </m.div>
                </div>
              </m.div>
            </>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </m.div>
  );
}
