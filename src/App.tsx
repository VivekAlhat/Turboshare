import Peer, { DataConnection } from "peerjs";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CustomFile } from "@/types/types";
import { useToast } from "@/components/ui/use-toast";
import { downloadFileToStorage, startNewSession } from "@/utils/utils";

const App: React.FC = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  // peer connection id of other user
  const [peerConnectionId, setPeerConnectionId] = useState<string | null>(null);
  // store dataconnection between two peers
  const [peerConnection, setPeerConnection] = useState<DataConnection | null>(
    null
  );

  const { toast } = useToast();

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useDropzone({
      multiple: false,
      maxFiles: 1,
    });

  const handleSessionStart = async () => {
    const peer = new Peer();
    peer.on("connection", (dc) => {
      setPeerConnection(dc);
      dc.on("data", (data) => {
        const file = data as CustomFile;
        downloadFileToStorage(file.blob, file.name);
        toast({ title: `New file: ${file.name}` });
      });
      // close peer connection when session is terminated by other user
      dc.on("close", () => setPeerConnection(null));
    });
    await startNewSession(peer);
    setPeer(peer);
  };

  const handleSessionStop = () => {
    if (peer) {
      peer.destroy();
      setPeer(null);
      setPeerConnection(null);
      setPeerConnectionId(null);
      peerConnection?.close();
    }
  };

  const handlePeerConnection = () => {
    if (!peerConnectionId) {
      toast({ title: "No peer to connect" });
      return;
    }

    if (peerConnectionId === peer?.id) {
      toast({ title: "You can't connect with yourself" });
      return;
    }

    const connection: DataConnection | undefined = peer?.connect(
      peerConnectionId,
      {
        reliable: true,
      }
    );
    if (!connection) {
      toast({ title: "Couldn't establish peer connection" });
    } else {
      setPeerConnection(connection);
      // below will be displayed to the who makes the connection
      connection.on("data", (data) => {
        const file = data as CustomFile;
        downloadFileToStorage(file.blob, file.name);
        toast({ title: `New file: ${file.name}` });
      });
    }
  };

  const handleFileSend = () => {
    if (!peerConnection) {
      toast({ title: "No peer connected" });
      return;
    }
    if (acceptedFiles.length === 0) {
      toast({ title: "Please select a file" });
      return;
    }
    const file = acceptedFiles[0] as File;
    const blob = new Blob([file], { type: file.type });
    peerConnection.send({
      type: "file",
      blob,
      name: file.name,
      size: file.size,
      mime: file.type,
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(peer!.id);
    toast({ title: "Your ID is copied to clipboard" });
  };

  useEffect(() => {
    return () => {
      if (peer) {
        peer.destroy();
        setPeer(null);
        setPeerConnection(null);
        setPeerConnectionId(null);
      }
    };
  }, [peer]);

  return (
    <main className="h-screen font-inter">
      <section className="px-6 pt-12 text-center space-y-2 relative overflow-hidden">
        <h1 className="text-6xl font-bold">Turboshare</h1>
        <p className="font-semibold">Lightning-fast P2P File Sharing</p>
        <p className="text-gray-700 font-medium">
          TurboShare harnesses the power of PeerJS for a blazing-fast, secure,
          <br />
          and decentralized file sharing experience.
        </p>
        <div className="py-4">
          {!peer ? (
            <button
              className="bg-gradient-to-r font-semibold text-white from-purple-400 via-purple-600 to-indigo-400 px-4 py-2 rounded-lg"
              onClick={handleSessionStart}
            >
              Start New Session
            </button>
          ) : (
            <button
              className="bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold px-4 py-2 rounded-lg"
              onClick={handleSessionStop}
            >
              Stop Session
            </button>
          )}
        </div>
      </section>
      <section className="space-y-4 p-6 flex flex-col items-center justify-center">
        {peer && (
          <div className="space-y-4 text-center">
            <p>
              Your peer ID is:{" "}
              <span className="font-semibold" onClick={copyToClipboard}>
                {peer?.id}
              </span>
            </p>
            <div>
              {!peerConnection ? (
                <div className="space-y-4 text-center">
                  <p>Connect with other peers to start sharing files.</p>
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Enter peer id"
                      className="border border-slate-300 px-4 py-2 rounded-lg w-full"
                      onChange={(e) => setPeerConnectionId(e.target.value)}
                    />
                    <button
                      className="bg-purple-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-600"
                      onClick={handlePeerConnection}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-left">
                  <p>
                    You are connected with:&nbsp;
                    <span className="font-semibold">
                      {peerConnection?.peer}
                    </span>
                  </p>
                  <div className="space-y-2">
                    <div
                      {...getRootProps()}
                      className="w-full border cursor-pointer p-5 text-center border-dashed border-slate-400 h-[200px] flex items-center justify-center"
                    >
                      <input {...getInputProps()} />
                      {isDragActive ? (
                        <p>Drop the files here ...</p>
                      ) : (
                        <p>
                          Drag 'n' drop some files here, or click to select
                          files
                        </p>
                      )}
                    </div>
                    {
                      <div>
                        <p>Selected:&nbsp;</p>
                        <ul>
                          {acceptedFiles?.map((file) => (
                            <li key={file.name}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    }
                    <button
                      className="bg-purple-500 font-semibold text-white px-4 py-2 rounded-lg hover:bg-purple-600 w-full"
                      onClick={handleFileSend}
                    >
                      Share
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default App;
