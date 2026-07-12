import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const faqs = [
  {
    question: "What is LinkIn?",
    answer:
      "LinkIn is a platform that lets you create one beautiful profile containing all your important online links — social media, portfolio, GitHub, LinkedIn, resume, and more. You share only one URL.",
  },
  {
    question: "Is LinkIn free to use?",
    answer:
      "Yes! LinkIn offers a free plan that includes all essential features. You can create your profile, add unlimited links, and generate a QR code at no cost.",
  },
  {
    question: "Can I customize my profile?",
    answer:
      "Absolutely. LinkIn provides multiple themes and customization options so your profile matches your personal brand and style.",
  },
  {
    question: "How does the QR code feature work?",
    answer:
      "Once your profile is set up, you can generate a custom QR code that links directly to your profile. Share it on business cards, posters, or anywhere offline.",
  },
  {
    question: "Can I track who visits my profile?",
    answer:
      "Yes. LinkIn includes built-in analytics that show you profile views, link clicks, and referral sources so you can understand your audience.",
  },
];

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-foreground pr-4">{question}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about LinkIn.
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="px-6">
            {faqs.map((faq, i) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
