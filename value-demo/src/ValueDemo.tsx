import React from "react";
import { Audio, Series, staticFile } from "remotion";
import { TitleScene } from "./scenes/TitleScene";
import { ValueSectionScene } from "./scenes/ValueSectionScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { coreValues } from "./data/scenarios";

const TITLE_DURATION = 90;
const SCENES_PER_SECTION_BASE = 25;
const SCENARIO_TIME = 100;
const CLOSING_DURATION = 120;

export const ValueDemo: React.FC = () => {
  return (
    <>
      <Audio src={staticFile("bgm.mp3")} volume={0.8} />
      <Series>
      {/* Title */}
      <Series.Sequence durationInFrames={TITLE_DURATION}>
        <TitleScene />
      </Series.Sequence>

      {/* Core value sections */}
      {coreValues.map((cv, index) => {
        const sectionDuration =
          SCENES_PER_SECTION_BASE + cv.scenarios.length * SCENARIO_TIME;
        return (
          <Series.Sequence key={cv.id} durationInFrames={sectionDuration}>
            <ValueSectionScene coreValue={cv} sectionIndex={index} />
          </Series.Sequence>
        );
      })}

      {/* Closing */}
      <Series.Sequence durationInFrames={CLOSING_DURATION}>
        <ClosingScene />
      </Series.Sequence>
    </Series>
    </>
  );
};
