"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
// import { interviewer } from "@/constants";
// import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    // const handleGenerateFeedback = async (messages: SavedMessage[]) => {
    //   console.log("handleGenerateFeedback");

    //   const { success, feedbackId: id } = await createFeedback({
    //     interviewId: interviewId!,
    //     userId: userId!,
    //     transcript: messages,
    //     feedbackId,
    //   });

    //   if (success && id) {
    //     router.push(`/interview/${interviewId}/feedback`);
    //   } else {
    //     console.log("Error saving feedback");
    //     router.push("/");
    //   }
    // };

    // if (callStatus === CallStatus.FINISHED) {
    //   if (type === "generate") {
    //     router.push("/");
    //   }}
    //   } else {
    // //     handleGenerateFeedback(messages);
    // //   }
    // // }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      // await vapi.start(interviewer, {
      //   variableValues: {
      //     questions: formattedQuestions,
      //   },
      // });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#f4f7fa] py-8 px-2">
      <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center justify-center w-full max-w-5xl mb-10">
        {/* AI Interviewer Card */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl shadow-lg p-10 w-full max-w-md min-h-[320px]">
          <div className="flex items-center justify-center bg-white bg-opacity-20 rounded-full w-32 h-32 mb-6 border-4 border-blue-300">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={90}
              height={90}
              className="object-cover"
            />
            {isSpeaking && <span className="absolute animate-ping rounded-full bg-blue-300 opacity-60 w-32 h-32" />}
          </div>
          <h3 className="text-2xl font-bold mb-2">AI Interviewer</h3>
          <span className="text-blue-100 text-sm">Ready to challenge you!</span>
        </div>

        {/* User Profile Card */}
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl p-10 w-full max-w-md min-h-[320px] border border-gray-200">
          <div className="flex items-center justify-center bg-gray-100 rounded-full w-32 h-32 mb-6 border-4 border-gray-300">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={90}
              height={90}
              className="object-cover rounded-full"
            />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-gray-800">{userName}</h3>
          <span className="text-gray-500 text-sm">You</span>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="w-full max-w-2xl mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center border border-gray-200">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100 text-lg text-gray-700"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col items-center justify-center gap-4">
        {callStatus === "ACTIVE" ? (
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transition-all duration-200"
            onClick={() => handleDisconnect()}
          >
            End Interview
          </button>
        ) : callStatus === "FINISHED" ? (
          <>
            <button
              className="relative bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transition-all duration-200"
              onClick={() => handleCall()}
            >
              <span className="relative">Start Interview</span>
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transition-all duration-200"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('interviewMessages', JSON.stringify(messages));
                }
                router.push('/interview/review');
              }}
            >
              View Interview & Feedback
            </button>
          </>
        ) : (
          <button
            className="relative bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transition-all duration-200"
            onClick={() => handleCall()}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full bg-green-300 opacity-60 w-full h-full left-0 top-0",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span className="relative">
              Start Interview
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Agent;
