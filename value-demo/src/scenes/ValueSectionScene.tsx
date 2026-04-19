import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { CoreValue } from "../data/scenarios";

const SCENARIO_ENTER_DURATION = 20;
const SECTION_TITLE_DURATION = 30;
const SCENARIO_DISPLAY_DURATION = 90;

export const ValueSectionScene: React.FC<{
  coreValue: CoreValue;
  sectionIndex: number;
}> = ({ coreValue, sectionIndex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Section title animation
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 60 },
  });

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleX = interpolate(titleProgress, [0, 1], [-60, 0]);

  // Color accent bar
  const accentScale = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)",
        padding: 60,
        flexDirection: "column",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(108,92,231,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Section number badge */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 60,
          opacity: interpolate(frame, [5, 20], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: coreValue.color,
            opacity: 0.1,
            lineHeight: 1,
          }}
        >
          0{sectionIndex + 1}
        </div>
      </div>

      {/* Section header */}
      <div
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 40,
          marginTop: 20,
        }}
      >
        {/* Color accent bar */}
        <div
          style={{
            width: 6,
            height: 60,
            borderRadius: 3,
            background: coreValue.color,
            marginRight: 24,
            transform: `scaleY(${accentScale})`,
            transformOrigin: "top",
            boxShadow: `0 0 20px ${coreValue.color}60`,
          }}
        />
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateX(${titleX}px)`,
          }}
        >
          <h2
            style={{
              fontSize: 36,
              fontWeight: "bold",
              color: "white",
              margin: 0,
              lineHeight: 1.4,
              whiteSpace: "pre-line",
            }}
          >
            {coreValue.title}
          </h2>
        </div>
      </div>

      {/* Scenario cards */}
      <div
        style={{
          flex: 1,
          flexDirection: "column",
          gap: 16,
        }}
      >
        {coreValue.scenarios.map((scenario, i) => {
          const enterFrame = SECTION_TITLE_DURATION + i * SCENARIO_ENTER_DURATION;
          const cardOpacity = interpolate(
            frame,
            [enterFrame, enterFrame + 15],
            [0, 1],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );
          const cardY = interpolate(
            frame,
            [enterFrame, enterFrame + 15],
            [30, 0],
            { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
          );
          const cardScale = spring({
            frame: frame - enterFrame,
            fps,
            config: { damping: 14, stiffness: 80 },
          });

          if (frame < enterFrame) return null;

          return (
            <div
              key={i}
              style={{
                opacity: cardOpacity,
                transform: `translateY(${cardY}px) scale(${cardScale})`,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 16,
                border: `1px solid ${coreValue.color}20`,
                padding: "20px 28px",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 20,
              }}
            >
              {/* Scenario index */}
              <div
                style={{
                  minWidth: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${coreValue.color}20`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: coreValue.color,
                  }}
                >
                  {i + 1}
                </span>
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "white",
                    margin: 0,
                    marginBottom: 8,
                  }}
                >
                  {scenario.title}
                </h3>
                <div style={{ flexDirection: "row", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#e17055",
                        fontWeight: "bold",
                        letterSpacing: 1,
                      }}
                    >
                      痛点
                    </span>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#8a8ab0",
                        margin: 0,
                        marginTop: 4,
                        lineHeight: 1.5,
                      }}
                    >
                      {scenario.painPoint}
                    </p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#00b894",
                        fontWeight: "bold",
                        letterSpacing: 1,
                      }}
                    >
                      方案
                    </span>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#8a8ab0",
                        margin: 0,
                        marginTop: 4,
                        lineHeight: 1.5,
                      }}
                    >
                      {scenario.solution}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom color line */}
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${coreValue.color}, transparent)`,
          marginTop: 30,
          transform: `scaleX(${interpolate(frame, [20, 50], [0, 1], {
            extrapolateRight: "clamp",
          })})`,
          transformOrigin: "left",
        }}
      />
    </AbsoluteFill>
  );
};
