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

const RoomJoinModal = ({ isOpen, isInRoom, onCreateRoom, onJoinRoom, error, isLoading, validateInputs }) => {
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [roomNameError, setRoomNameError] = useState(false);
  const [playerNameError, setPlayerNameError] = useState(false);

  const localValidateInputs = () => {
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
      setLocalError("ルーム名とプレイヤー名は必須です");
    } else {
      setLocalError("");
    }

    return isValid;
  };

  const handleJoinRoom = async () => {
    if (!localValidateInputs()) return;

    setLocalIsLoading(true);
    setLocalError("");
    try {
      await onJoinRoom({ roomName: roomName.trim(), playerName: playerName.trim() });
      setRoomName("");
      setPlayerName("");
    } catch (err) {
      setLocalError("ルーム参加に失敗しました");
    } finally {
      setLocalIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!localValidateInputs()) return;

    setLocalIsLoading(true);
    setLocalError("");
    try {
      await onCreateRoom({ roomName: roomName.trim(), playerName: playerName.trim() });
      setRoomName("");
      setPlayerName("");
    } catch (err) {
      setLocalError("ルーム作成に失敗しました");
    } finally {
      setLocalIsLoading(false);
    }
  };

  const handleRoomNameChange = (e) => {
    setRoomName(e.target.value);
    if (e.target.value.trim()) {
      setRoomNameError(false);
    }
    if (localError) setLocalError("");
  };

  const handlePlayerNameChange = (e) => {
    setPlayerName(e.target.value);
    if (e.target.value.trim()) {
      setPlayerNameError(false);
    }
    if (localError) setLocalError("");
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
          {localError && (
            <Alert variant="destructive" className="animate-shake">
              <AlertDescription className="flex items-center gap-2">
                <X className="h-4 w-4" />
                {localError}
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
                disabled={localIsLoading}
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
                disabled={localIsLoading}
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
            disabled={localIsLoading} 
            className="h-11 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
          >
            {localIsLoading ? (
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
            disabled={localIsLoading} 
            className="h-11 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
          >
            {localIsLoading ? (
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