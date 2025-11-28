import React from "react";
import { ConnectionStatus } from "../types";

interface Props {
  status: ConnectionStatus;
  onReconnect: () => void;
}

export const ConnectionIndicator: React.FC<Props> = ({
  status,
  onReconnect,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          color: "bg-green-500",
          text: "Connected",
          pulse: false,
        };
      case "connecting":
        return {
          color: "bg-yellow-500",
          text: "Connecting...",
          pulse: true,
        };
      case "disconnected":
        return {
          color: "bg-gray-500",
          text: "Disconnected",
          pulse: false,
        };
      case "error":
        return {
          color: "bg-red-500",
          text: "Error",
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-regular dark:bg-bg-regular-dark rounded-full">
        <div
          className={`w-2 h-2 rounded-full ${config.color} ${
            config.pulse ? "animate-pulse" : ""
          }`}
        />
        <span className="text-xs text-text-secondary dark:text-text-secondary-dark font-medium">
          {config.text}
        </span>
      </div>
      {(status === "disconnected" || status === "error") && (
        <button
          onClick={onReconnect}
          className="px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-full transition-colors"
        >
          Reconnect
        </button>
      )}
    </div>
  );
};
