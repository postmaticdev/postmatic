import { MacWindow } from "./custom/mac-window";
import texts from "@/content/id/text.json";
import { TextAnimate } from "./magicui/text-animate";
import { VIDEO_TUTORIAL_URL } from "@/constants";
import { getContainerMargins } from "@/lib/utils";

export default function IntroVideoPage() {
  // Create a clean YouTube URL with autoplay, loop, and no suggestions
  const createCleanVideoUrl = (baseUrl: string) => {
    const url = new URL(baseUrl);
    url.searchParams.set('rel', '0');           // No related videos
    url.searchParams.set('showinfo', '0');      // No video info
    url.searchParams.set('controls', '1');      // Show video controls
    url.searchParams.set('modestbranding', '1'); // Minimal YouTube branding
    url.searchParams.set('loop', '1');          // Loop video
    url.searchParams.set('playlist', 'ad79nYk2keg'); // Required for loop to work
    url.searchParams.set('autoplay', '0');      // Start paused (user clicks to play)
    url.searchParams.set('mute', '0');          // Audio enabled
    url.searchParams.set('fs', '1');            // Allow fullscreen
    return url.toString();
  };

  const cleanVideoUrl = createCleanVideoUrl(VIDEO_TUTORIAL_URL);

  return (
    <section id="tutorial" className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-black dark:via-slate-950 dark:to-slate-900">
      <div className={getContainerMargins()}>
        {/* Header */}
        <div className="text-center mb-12">
          <TextAnimate className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-extrabold -tracking-widest text-black dark:text-white" animation="blurInUp" by="character" once startOnView>
            It&#39;s Cool, Right?!
          </TextAnimate>
        </div>

        {/* YouTube Embed */}
        <MacWindow
          keepAspectRatio
          hoverZoom={false}
          title={texts.introVideo.windowTitle}
          className="max-w-4xl mx-auto dark:border dark:border-slate-700"
        >
          <div className="aspect-w-16 aspect-h-10 h-full">
            <iframe
              className="w-full h-full rounded"
              src={cleanVideoUrl}
              title={texts.introVideo.windowTitle}
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
              allowFullScreen
            />
          </div>
        </MacWindow>
      </div>
    </section>
  );
}
