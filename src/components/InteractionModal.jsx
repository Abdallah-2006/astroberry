import { useEffect, useState } from "react";
import Portrait from "./Portrait";
import PixelIcon from "./PixelIcon";
import { PORTRAITS } from "../data/portraits";
import { canAfford } from "../logic/resources";
import { COMMANDER } from "../logic/profile";
import { playVoiceStart } from "../lib/audio";

const COST_ICONS = {
  spareParts: "wrench",
  storedPower: "bolt",
  powerCondition: "bolt",
  water: "drop",
  food: "leaf",
  lifeSupportCondition: "drop",
  habitatSafety: "home",
};

const REPORT_COLORS = {
  bolt: "#ffd166",
  drop: "#7ee0ff",
  leaf: "#9df5a8",
  home: "#ff9ecb",
  wrench: "#ffb066",
};

function ReportBar({ report, resources }) {
  if (!report) return null;

  const value = Math.max(0, Math.min(100, resources?.[report.resource] ?? 0));
  const filled = Math.round((value / 100) * 8);
  const color = REPORT_COLORS[report.icon] ?? "#ffd166";

  return (
    <div className="vn-report" style={{ "--report-color": color }}>
      <span className="vn-report-label">
        <PixelIcon name={report.icon} size={11} />
        {report.label}
      </span>
      <span className="vn-report-track" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className={i < filled ? "is-filled" : ""} />
        ))}
      </span>
      <span className="vn-report-hint">{report.hint}</span>
    </div>
  );
}

function CostPips({ cost }) {
  if (!cost) return null;

  return (
    <span className="cost-pips">
      {Object.entries(cost).flatMap(([key, amount]) =>
        Array.from({ length: Math.min(4, amount) }, (_, i) => (
          <PixelIcon key={`${key}-${i}`} name={COST_ICONS[key] ?? "wrench"} size={10} />
        )),
      )}
    </span>
  );
}

export default function InteractionModal({ content, resources, onChoose, onGoto, onClose }) {
  const lines = content.body ?? [];
  const transcriptKey = `${content?.targetId ?? ""}|${content?.title ?? ""}|${content?.chosenId ?? ""}|${content?.result ? "result" : "lines"}`;
  const [lineState, setLineState] = useState({ key: transcriptKey, index: 0 });
  const lineIndex =
    lineState.key === transcriptKey
      ? Math.min(lineState.index, Math.max(0, lines.length - 1))
      : 0;
  const goToLine = (next) => setLineState({ key: transcriptKey, index: next });

  // Every new transcript beat gets the radio squelch, including each "Next"
  // and each new bubble in the same session.
  useEffect(() => {
    playVoiceStart();
  }, [transcriptKey, lineIndex]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const speaker = PORTRAITS[content.speaker] ?? PORTRAITS.layla;
  const resolved =
    content.chosenId && content.choices
      ? content.choices.find((choice) => choice.id === content.chosenId)
      : null;
  const resultText = content.result ?? resolved?.result ?? null;
  const dialogueFinished = resultText || lines.length === 0 || lineIndex >= lines.length - 1;
  const showChoices = content.choices && !resultText && dialogueFinished;

  return (
    <div
      className="vn-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interaction-title"
    >
      <div className="vn-stage">
        <div className="vn-portrait-wrap">
          <Portrait id={content.speaker} size={190} />
        </div>

        <article className="vn-panel">
          <p className="vn-speaker">
            {speaker.name} <span>{speaker.role}</span>
          </p>
          <h2 id="interaction-title" className="vn-title">
            {content.title}
          </h2>

          {!resultText && lines.length > 0 && (
            <div className="vn-lines voice-chat-line" aria-live="polite">
              <span className="voice-chat-indicator"><i /><i /><i /><i /></span>
              <p>{lines[lineIndex]}</p>
              <small>VOICE LINK · {lineIndex + 1}/{lines.length}</small>
            </div>
          )}

          {!showChoices && <ReportBar report={content.report} resources={resources} />}

          {resultText && (
            <div className="vn-result">
              <PixelIcon name="star" size={16} />
              <p>{resultText}</p>
            </div>
          )}

          {showChoices && (
            <div className="vn-choices">
              {content.choices.map((choice) => {
                const affordable = canAfford(resources, choice.cost);
                return (
                  <button
                    type="button"
                    key={choice.id}
                    className="vn-choice"
                    disabled={!affordable}
                    onClick={() => onChoose(choice)}
                  >
                    <span className="vn-choice-icon">
                      <PixelIcon name={choice.icon ?? "wrench"} size={14} />
                    </span>
                    <span className="vn-choice-text">
                      <span className="vn-choice-label">{choice.label}</span>
                      <span className="vn-choice-detail">{choice.detail}</span>
                    </span>
                    <CostPips cost={choice.cost} />
                  </button>
                );
              })}
            </div>
          )}

          <div className="vn-actions">
            <span className="vn-hint">
              {showChoices
                ? `Your turn, ${COMMANDER}.`
                : resultText
                  ? `Nice work, ${COMMANDER}.`
                  : "Incoming crew transmission"}
            </span>
            {!resultText && !dialogueFinished && (
              <button type="button" className="primary-button voice-next" onClick={() => goToLine(Math.min(lineIndex + 1, lines.length - 1))}>
                Next transmission →
              </button>
            )}
            {content.goto && !resultText && dialogueFinished && (
              <button
                type="button"
                className="primary-button"
                onClick={() => onGoto(content.goto)}
              >
                {content.goto.label ?? "Show me"}
              </button>
            )}
            {dialogueFinished && !showChoices && (
              <button type="button" className="ghost-button" onClick={onClose}>
                {resultText ? "Yay!" : "Okay!"}
              </button>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
