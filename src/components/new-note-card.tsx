import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void;
}

let SpeechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [content, setContent] = useState("");

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);

    if (event.target.value === "") {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault();

    if (content === "") {
      return;
    }

    onNoteCreated(content);

    setContent("");
    setShouldShowOnboarding(true);

    toast.success("Nota criada com sucesso!");
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!isSpeechRecognitionAPIAvailable) {
      alert("Infelizmente seu navegador não suporta a API de gravção!");
      return;
    }

    setIsRecording(true);
    setShouldShowOnboarding(false);

    const SpeechRegonitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    SpeechRecognition = new SpeechRegonitionAPI();

    SpeechRecognition.lang = "pt-BR";
    SpeechRecognition.continuous = true;
    SpeechRecognition.maxAlternatives = 1;
    SpeechRecognition.interimResults = true;

    SpeechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");

      setContent(transcription);
    };

    SpeechRecognition.onerror = (event) => {
      console.log(event);
    };

    SpeechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecording(false);

    if (SpeechRecognition !== null) {
      SpeechRecognition.stop();
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 p-5 gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-lime-400 hover:ring-2 ring-slate-600">
        <span className="text-sm font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto
          automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/60" />
        <Dialog.Content className="overflow-hidden fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>

          <form className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className="text-sm font-medium text-slate-300">
                Adicionar nota
              </span>
              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400">
                  Comece{" "}
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="font-medium text-lime-400 hover:underline"
                  >
                    gravando um nota
                  </button>{" "}
                  em áudio ou se prefirir{" "}
                  <button
                    type="button"
                    onClick={handleStartEditor}
                    className="font-medium text-lime-400 hover:underline"
                  >
                    utilize apenas texto
                  </button>
                  .
                </p>
              ) : (
                <textarea
                  autoFocus
                  className="text-sm leading-6 text-slate-400 bg-transparent outline-none resize-none flex-1"
                  onChange={handleContentChanged}
                  value={content}
                />
              )}
            </div>

            {isRecording ? (
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center texte-sm text-slate-300 outline-none hover:text-slate-100"
                onClick={handleStopRecording}
              >
                <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                Gravando! (Clique p/ interromper)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveNote}
                className="w-full bg-lime-400 py-4 text-center texte-sm text-lime-950 outline-none hover:bg-lime-500"
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
