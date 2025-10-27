import { useState } from "react";
import CaseImage from "../assets/Case.png";
import BlogsImage from "../assets/Blog.png";
import OurPricingImage from "../assets/Ourpricing.png";
import FinrightNewsImage from "../assets/Finrightnews.png";
import "./MoreForYouSlider.css";
import { IoCloseSharp } from "react-icons/io5"; 

export default function MoreForYouSlider() {
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);

    const cards = [
        {
            image: CaseImage,
            title: "What is UAN?",
            body: "How we helped our users’ when all other doors were closed",
            url: "",
        },
        {
            image: BlogsImage,
            title: "Why Form 11 is important",
            body: "Understand your PF and know the rules that govern your fund",
            url: "",
        },
        {
            image: OurPricingImage,
            title: "Our Pricing",
            body: "We promise transparent pricing and refund guarantee",
            url: "",
        },
        {
            image: FinrightNewsImage,
            title: "FinRight in News",
            body: "Our work has been recognised by leading new platforms",
            url: "",
        },
    ];

    return (
        <div style={{ position: "relative" }}>
            {/* IFRAME VIEW */}
            {iframeUrl && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100vh",
                        backgroundColor: "white",
                        zIndex: 9999,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            padding: "1rem",
                            background: "#fff",
                            borderBottom: "1px solid #ccc",
                            zIndex: 10000,
                        }}
                    >
                        <IoCloseSharp
                            onClick={() => setIframeUrl(null)}
                            style={{
                                fontSize: "1.5rem",
                                cursor: "pointer",
                                color: "#333",
                            }}
                        />
                    </div>
                    <iframe
                        src={iframeUrl}
                        title="More For You"
                        style={{ flexGrow: 1, border: "none" }}
                    />
                </div>
            )}

            {/* TILE SLIDER VIEW */}
            <div
                className="d-flex overflow-auto scroll-container"
                style={{
                    gap: "1rem",
                    padding: "1rem",
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        onClick={() => setIframeUrl(card.url)}
                        style={{
                            flex: "0 0 85%",
                            maxWidth: "85%",
                            minWidth: "85%",
                            scrollSnapAlign: "start",
                            textDecoration: "none",
                            cursor: "pointer",
                        }}
                    >
                        <div
                            className="card border-0 shadow-sm p-2"
                            style={{
                                borderRadius: "1rem",
                                overflow: "hidden",
                                backgroundColor: "#F7F9FF",
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                            }}
                        >
                            <img src={card.image} alt={card.title} style={{ width: "100%", height: "auto" }} />
                            <div className="py-3">
                                <p
                                    className="mb-2 py-2"
                                    style={{
                                        fontSize: "0.8125rem",
                                        fontWeight: 600,
                                        lineHeight: "100%",
                                        color: "#000",
                                    }}
                                >
                                    {card.title}
                                </p>
                                {/* <p
                                    style={{
                                        fontSize: "0.8125rem",
                                        fontWeight: 400,
                                        lineHeight: "120%",
                                        marginBottom: 0,
                                        color: "#000",
                                    }}
                                >
                                    {card.body}
                                </p> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
