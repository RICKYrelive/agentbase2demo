import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { coreValues } from "../data/scenarios";

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });

  const pillOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateRight: "clamp",
  });
  const ctaY = interpolate(frame, [50, 70], [20, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(108,92,231,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,92,231,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Title */}
      <div
        style={{
          transform: `scale(${titleScale})`,
          textAlign: "center",
          marginBottom: 50,
        }}
      >
        <h1
          style={{
            fontSize: 64,
            fontWeight: "bold",
            color: "white",
            margin: 0,
            letterSpacing: -1,
          }}
        >
          AgentBase 2.0
        </h1>
      </div>

      {/* Value pills */}
      <div
        style={{
          flexDirection: "row",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1400,
          opacity: pillOpacity,
        }}
      >
        {coreValues.map((cv, i) => {
          const pillDelay = 20 + i * 8;
          const pillOp = interpolate(frame, [pillDelay, pillDelay + 15], [0, 1], {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          });
          const pillScale = spring({
            frame: frame - pillDelay,
            fps,
            config: { damping: 14, stiffness: 100 },
          });

          return (
            <div
              key={cv.id}
              style={{
                opacity: pillOp,
                transform: `scale(${pillScale})`,
                background: `${cv.color}18`,
                border: `1px solid ${cv.color}40`,
                borderRadius: 100,
                padding: "12px 24px",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: cv.color,
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  color: "#d0d0e0",
                  fontWeight: 500,
                }}
              >
                {cv.title.replace("\n", " · ")}
              </span>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div
        style={{
          marginTop: 60,
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #6C5CE7, #a29bfe)",
            borderRadius: 16,
            padding: "16px 48px",
          }}
        >
          <span
            style={{
              fontSize: 24,
              color: "white",
              fontWeight: 600,
            }}
          >
            开始构建你的 Agent
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
