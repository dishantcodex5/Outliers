import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import "./ChromaGrid.css";

export interface ChromaItem {
  image: string;
  title: string;
  subtitle: string;
  handle?: string;
  location?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
  rating?: number;
  reviews?: number;
  isOnline?: boolean;
  skillsOffered?: string[];
  skillsWanted?: string[];
  availability?: string;
  onClick?: () => void;
}

export interface ChromaGridProps {
  items?: ChromaItem[];
  className?: string;
  radius?: number;
  columns?: number;
  rows?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
}

type SetterFn = (v: number | string) => void;

export const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  className = "",
  radius = 300,
  columns = 3,
  rows = 2,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<SetterFn | null>(null);
  const setY = useRef<SetterFn | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  const demo: ChromaItem[] = [
    {
      image: "https://i.pravatar.cc/300?img=8",
      title: "Alex Rivera",
      subtitle: "Full Stack Developer",
      handle: "@alexrivera",
      location: "San Francisco, CA",
      borderColor: "#4F46E5",
      gradient: "linear-gradient(145deg, #4F46E5, #1e293b)",
      url: "https://github.com/",
      rating: 4.9,
      reviews: 23,
      isOnline: true,
      skillsOffered: ["React", "Node.js", "TypeScript"],
      skillsWanted: ["UI/UX Design", "Figma"],
      availability: "Weekends",
    },
    {
      image: "https://i.pravatar.cc/300?img=11",
      title: "Jordan Chen",
      subtitle: "DevOps Engineer",
      handle: "@jordanchen",
      location: "New York, NY",
      borderColor: "#10B981",
      gradient: "linear-gradient(210deg, #10B981, #1e293b)",
      url: "https://linkedin.com/in/",
      rating: 5.0,
      reviews: 31,
      isOnline: false,
      skillsOffered: ["Docker", "AWS", "Kubernetes"],
      skillsWanted: ["Python", "Data Analysis"],
      availability: "Evenings",
    },
    {
      image: "https://i.pravatar.cc/300?img=3",
      title: "Morgan Blake",
      subtitle: "UI/UX Designer",
      handle: "@morganblake",
      location: "Remote",
      borderColor: "#F59E0B",
      gradient: "linear-gradient(165deg, #F59E0B, #1e293b)",
      url: "https://dribbble.com/",
      rating: 4.8,
      reviews: 18,
      isOnline: true,
      skillsOffered: ["Figma", "Adobe XD", "Prototyping"],
      skillsWanted: ["Web Development", "SEO"],
      availability: "Flexible",
    },
    {
      image: "https://i.pravatar.cc/300?img=16",
      title: "Casey Park",
      subtitle: "Data Scientist",
      handle: "@caseypark",
      location: "Los Angeles, CA",
      borderColor: "#EF4444",
      gradient: "linear-gradient(195deg, #EF4444, #1e293b)",
      url: "https://kaggle.com/",
      rating: 4.7,
      reviews: 15,
      isOnline: true,
      skillsOffered: ["Python", "Machine Learning", "TensorFlow"],
      skillsWanted: ["Social Media Marketing", "Analytics"],
      availability: "Weekdays",
    },
    {
      image: "https://i.pravatar.cc/300?img=25",
      title: "Sam Kim",
      subtitle: "Mobile Developer",
      handle: "@thesamkim",
      location: "Chicago, IL",
      borderColor: "#8B5CF6",
      gradient: "linear-gradient(225deg, #8B5CF6, #1e293b)",
      url: "https://github.com/",
      rating: 4.9,
      reviews: 27,
      isOnline: false,
      skillsOffered: ["React Native", "Swift", "Kotlin"],
      skillsWanted: ["Graphic Design", "Video Production"],
      availability: "Weekends",
    },
    {
      image: "https://i.pravatar.cc/300?img=60",
      title: "Tyler Rodriguez",
      subtitle: "Cloud Architect",
      handle: "@tylerrod",
      location: "Seattle, WA",
      borderColor: "#06B6D4",
      gradient: "linear-gradient(135deg, #06B6D4, #1e293b)",
      url: "https://aws.amazon.com/",
      rating: 5.0,
      reviews: 42,
      isOnline: true,
      skillsOffered: ["AWS", "Azure", "DevOps"],
      skillsWanted: ["React Native", "Mobile Development"],
      availability: "Evenings",
    },
  ];

  const data = items?.length ? items : demo;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, "--x", "px") as SetterFn;
    setY.current = gsap.quickSetter(el, "--y", "px") as SetterFn;
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e: React.PointerEvent) => {
    const r = rootRef.current!.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true,
    });
  };

  const handleCardClick = (item: ChromaItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleCardMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${className}`}
      style={
        {
          "--r": `${radius}px`,
          "--cols": columns,
          "--rows": rows,
        } as React.CSSProperties
      }
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {data.map((c, i) => (
        <article
          key={i}
          className="chroma-card"
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(c.url)}
          style={
            {
              "--card-border": c.borderColor || "#a855f7",
              "--card-gradient":
                c.gradient || "linear-gradient(145deg, #a855f7, #1e293b)",
              cursor: c.url ? "pointer" : "default",
            } as React.CSSProperties
          }
        >
          <div className="chroma-img-wrapper">
            <img src={c.image} alt={c.title} loading="lazy" />
            {c.isOnline && <div className="online-indicator" />}
          </div>
          <footer className="chroma-info">
            <div className="user-details">
              <h3 className="name">{c.title}</h3>
              {c.handle && <span className="handle">{c.handle}</span>}
              <p className="role">{c.subtitle}</p>
              {c.location && <span className="location">📍 {c.location}</span>}
              {c.rating && (
                <div className="rating">
                  <span className="stars">⭐ {c.rating}</span>
                  <span className="reviews">({c.reviews} reviews)</span>
                </div>
              )}
              {c.availability && (
                <span className="availability">🕐 {c.availability}</span>
              )}
            </div>
            {(c.skillsOffered || c.skillsWanted) && (
              <div className="skills">
                {c.skillsOffered && (
                  <div className="skills-section">
                    <span className="skills-label">Offers:</span>
                    <div className="skills-list">
                      {c.skillsOffered.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="skill-tag skill-offered">
                          {skill}
                        </span>
                      ))}
                      {c.skillsOffered.length > 2 && (
                        <span className="skill-tag skill-more">
                          +{c.skillsOffered.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {c.skillsWanted && (
                  <div className="skills-section">
                    <span className="skills-label">Wants:</span>
                    <div className="skills-list">
                      {c.skillsWanted.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="skill-tag skill-wanted">
                          {skill}
                        </span>
                      ))}
                      {c.skillsWanted.length > 2 && (
                        <span className="skill-tag skill-more">
                          +{c.skillsWanted.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </footer>
        </article>
      ))}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  );
};

export default ChromaGrid;
