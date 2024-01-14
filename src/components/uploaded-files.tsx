interface IUploadedFiles {
  uploadedFiles: File[];
}

const UploadedFiles: React.FC<IUploadedFiles> = ({ uploadedFiles }) => {
  return (
    <div className="flex items-center gap-2">
      <p>Selected:&nbsp;</p>
      <ul>
        {uploadedFiles?.map((file) => (
          <li key={file.name}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default UploadedFiles;
