import React, { useEffect, useState, useCallback } from "react";
import { Message } from "../types";

interface Props {
  messages: Message[];
  containerRef: React.RefObject<HTMLDivElement>;
  messageRefs: Map<string, HTMLDivElement>;
}

interface MessagePosition {
  id: string;
  content: string;
  position: number; // 0-100 percentage
}

export const ScrollIndicator: React.FC<Props> = ({
  messages,
  containerRef,
  messageRefs,
}) => {
  const [positions, setPositions] = useState<MessagePosition[]>([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);

  // Calculate message positions (only user messages)
  const calculatePositions = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollHeight = container.scrollHeight - container.clientHeight;

    if (scrollHeight <= 0) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    const newPositions: MessagePosition[] = [];

    // Only include user messages
    const userMessages = messages.filter((msg) => msg.role === "user");

    userMessages.forEach((msg) => {
      const element = messageRefs.get(msg.id);
      if (element) {
        const offsetTop = element.offsetTop;
        const percentage = Math.min(
          100,
          Math.max(0, (offsetTop / container.scrollHeight) * 100)
        );
        newPositions.push({
          id: msg.id,
          content: msg.content,
          position: percentage,
        });
      }
    });

    setPositions(newPositions);
  }, [messages, containerRef, messageRefs]);

  // Update current scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollHeight = container.scrollHeight - container.clientHeight;

    if (scrollHeight <= 0) return;

    const percentage = (container.scrollTop / scrollHeight) * 100;
    setCurrentPosition(percentage);
  }, [containerRef]);

  // Scroll to message
  const scrollToMessage = (messageId: string) => {
    const element = messageRefs.get(messageId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Truncate message for tooltip
  const truncateMessage = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  useEffect(() => {
    calculatePositions();
  }, [messages, calculatePositions]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(() => {
      calculatePositions();
      handleScroll();
    });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [containerRef, handleScroll, calculatePositions]);

  if (!isVisible || positions.length < 1) return null;

  return (
    <div className="absolute right-2 top-4 bottom-4 w-4 flex flex-col items-center z-10">
      {/* Track */}
      <div className="relative w-1 h-full bg-border-light dark:bg-border-light-dark rounded-full">
        {/* Current position indicator */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-500 rounded-full shadow-md transition-all duration-150 z-20"
          style={{ top: `calc(${currentPosition}% - 6px)` }}
        />

        {/* User message pins */}
        {positions.map((pos) => (
          <div
            key={pos.id}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: `calc(${pos.position}% - 4px)` }}
          >
            <button
              onClick={() => scrollToMessage(pos.id)}
              onMouseEnter={() => setHoveredMessage(pos.id)}
              onMouseLeave={() => setHoveredMessage(null)}
              className="w-2 h-2 rounded-full bg-purple-300 dark:bg-purple-500/50 transition-all duration-200 hover:scale-150 hover:bg-purple-500 hover:z-30"
              title="Your message"
            />

            {/* Tooltip on hover */}
            {hoveredMessage === pos.id && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2 whitespace-nowrap z-50">
                <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-[200px] truncate">
                  {truncateMessage(pos.content)}
                </div>
                {/* Arrow */}
                <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900 dark:border-l-gray-800" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
