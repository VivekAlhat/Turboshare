import { Peer, PeerError } from "peerjs";

const startNewSession = (peer: Peer): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      peer
        .on("open", (id: string) => {
          resolve(id);
        })
        .on("error", (error: PeerError<string>) => {
          reject(new Error(error.message));
        });
    } catch (err) {
      reject(err);
    }
  });
};

const downloadFileToStorage = (data: Blob, filename: string) => {
  const newBlob = new Blob([data], { type: data.type });
  const url = URL.createObjectURL(newBlob);
  const downloadLink = document.createElement("a");
  downloadLink.setAttribute("href", url);
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
};

export { startNewSession, downloadFileToStorage };
