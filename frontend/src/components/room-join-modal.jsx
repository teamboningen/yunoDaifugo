
import React, { useState, useEffect } from "react";
import { Check, Loader2, Users, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

export default function RoomJoinModal({ isOpen, isInRoom, onCreateRoom, onJoinRoom }) {
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [roomNameError, setRoomNameError] = useState(false);
  const [playerNameError, setPlayerNameError] = useState(false);

  const validateInputs = () => {
    let isValid = true;

    if (!roomName.trim()) {
      setRoomNameError(true);
      isValid = false;
    } else {
      setRoomNameError(false);
    }

    if (!playerName.trim()) {
      setPlayerNameError(true);
      isValid = false;
    } else {
      setPlayerNameError(false);
    }

    if (!isValid) {
      setError("ルーム名とプレイヤー名は必須です");
    } else {
      setError("");
    }

    return isValid;
  };

  const handleCreateRoom = () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    setError("");
    onCreateRoom({ roomName: roomName.trim(), playerName: playerName.trim() })
      .catch(err => {
        setError("ルーム作成に失敗しました");
      });
  };

  const handleJoinRoom = () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    setError("");
    onJoinRoom({ roomName: roomName.trim(), playerName: playerName.trim() })
      .catch(err => {
        setError("ルーム参加に失敗しました");
      });
  };

  const handleRoomNameChange = (e) => {
    setRoomName(e.target.value);
    if (e.target.value.trim()) {
      setRoomNameError(false);
    }
    if (error) setError("");
  };

  const handlePlayerNameChange = (e) => {
    setPlayerName(e.target.value);
    if (e.target.value.trim()) {
      setPlayerNameError(false);
    }
    if (error) setError("");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isInRoom) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isInRoom]);

  return (
    <Dialog open={isOpen && !isInRoom} modal={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5" />
            ルーム参加
          </DialogTitle>
          <DialogDescription>ルームを作成するか、既存のルームに参加してください</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-4">
          {error && (
            <Alert variant="destructive" className="animate-shake">
              <AlertDescription className="flex items-center gap-2">
                <X className="h-4 w-4" />
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="roomName" className="text-sm font-medium">
              ルーム名
            </Label>
            <div className="relative">
              <Input
                id="roomName"
                type="text"
                placeholder="ルーム名を入力"
                value={roomName}
                onChange={handleRoomNameChange}
                className={`pr-8 ${roomNameError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                disabled={isLoading}
              />
              {roomName && !roomNameError && <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />}
              {roomNameError && <X className="absolute right-3 top-2.5 h-4 w-4 text-red-500" />}
            </div>
            {roomNameError && <p className="text-xs text-red-500 mt-1">ルーム名を入力してください</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-sm font-medium">
              プレイヤー名
            </Label>
            <div className="relative">
              <Input
                id="playerName"
                type="text"
                placeholder="プレイヤー名を入力"
                value={playerName}
                onChange={handlePlayerNameChange}
                className={`pr-8 ${playerNameError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                disabled={isLoading}
              />
              {playerName && !playerNameError && <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />}
              {playerNameError && <X className="absolute right-3 top-2.5 h-4 w-4 text-red-500" />}
            </div>
            {playerNameError && <p className="text-xs text-red-500 mt-1">プレイヤー名を入力してください</p>}
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 sm:gap-0 mx-auto w-[80%]">
          <Button 
            variant="outline" 
            onClick={handleJoinRoom} 
            disabled={isLoading} 
            className="h-11 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                参加中...
              </>
            ) : (
              "既存ルームに参加"
            )}
          </Button>

          <Button 
            onClick={handleCreateRoom} 
            disabled={isLoading} 
            className="h-11 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                作成中...
              </>
            ) : (
              "新規ルームを作成"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
