import React, { useState } from 'react';
import { Form, Button } from 'semantic-ui-react';
import Auth from '../auth/Auth';
import { getUploadUrl, uploadFile } from '../api/todos-api';

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string;
    };
  };
  auth: Auth;
}

export default function EditTodo(props: EditTodoProps) {
  const [file, setFile] = useState<any>(undefined);
  const [uploadState, setUploadState] = useState<UploadState>(UploadState.NoUpload);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setFile(files[0]);
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    try {
      if (!file) {
        alert('File should be selected');
        return;
      }

      setUploadState(UploadState.FetchingPresignedUrl);
      const uploadUrl = await getUploadUrl(props.auth.getIdToken(), props.match.params.todoId);

      setUploadState(UploadState.UploadingFile);
      await uploadFile(uploadUrl, file);

      alert('File was uploaded!');
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message);
    } finally {
      setUploadState(UploadState.NoUpload);
    }
  };

  return (
    <div>
      <h1>Upload new image</h1>

      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <label>File</label>
          <input type="file" accept="image/*" placeholder="Image to upload" onChange={handleFileChange} />
        </Form.Field>
        <div>
          {uploadState === UploadState.FetchingPresignedUrl &&
            <p>Uploading image metadata</p>
          }
          {uploadState === UploadState.UploadingFile &&
            <p>Uploading file</p>
          }
          <Button loading={uploadState !== UploadState.NoUpload} type="submit">
            Upload
          </Button>
        </div>
      </Form>
    </div>
  );
};