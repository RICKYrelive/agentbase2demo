import { Composition } from "remotion";
import { ValueDemo } from "./ValueDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ValueDemo"
        component={ValueDemo}
        durationInFrames={1500}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
