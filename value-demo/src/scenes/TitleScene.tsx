import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const titleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [15, 30], [30, 0], {
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [30, 45], [20, 0], {
    extrapolateRight: "clamp",
  });

  const lineScale = interpolate(frame, [40, 60], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
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

      {/* Glow circle */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)",
          opacity: logoScale,
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          marginBottom: 30,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 24,
            background: "linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 48,
            fontWeight: "bold",
            color: "white",
            boxShadow: "0 20px 60px rgba(108,92,231,0.4)",
          }}
        >
          A
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: "bold",
            color: "white",
            margin: 0,
            letterSpacing: -2,
          }}
        >
          AgentBase 2.0
        </h1>
      </div>

      {/* Divider line */}
      <div
        style={{
          width: 200,
          height: 3,
          borderRadius: 2,
          background: "linear-gradient(90deg, #6C5CE7, #a29bfe)",
          marginTop: 24,
          marginBottom: 24,
          transform: `scaleX(${lineScale})`,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 32,
            color: "#a0a0c0",
            margin: 0,
            fontWeight: 300,
          }}
        >
          价值场景演示
        </p>
      </div>
    </AbsoluteFill>
  );
};
