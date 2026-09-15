import { useId, useMemo, useState } from 'react';
import { sanitizeHtml } from '../utils/sanitizeHtml';

type FaqDataContainerProps = {
  question: string;
  answer: string;
  defaultOpen?: boolean;
};

function FaqDataContainer({
  question,
  answer,
  defaultOpen = false,
}: FaqDataContainerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const answerId = useId();
  const questionId = useId();
  const sanitizedAnswer = useMemo(() => sanitizeHtml(answer), [answer]);

  return (
    <article className={`faq-data-container${isOpen ? ' is-active' : ''}`}>
      <h3 className="faq-question-heading">
        <button
          id={questionId}
          className="faq-question-button"
          type="button"
          aria-expanded={isOpen}
          aria-controls={answerId}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          <span>{question}</span>
          <span className="faq-toggle-icon" aria-hidden="true" />
        </button>
      </h3>

      <div
        id={answerId}
        className="faq-answer"
        role="region"
        aria-labelledby={questionId}
        hidden={!isOpen}
      >
        <div
          className="faq-answer-content"
          dangerouslySetInnerHTML={{ __html: sanitizedAnswer }}
        />
      </div>
    </article>
  );
}

export default FaqDataContainer;
