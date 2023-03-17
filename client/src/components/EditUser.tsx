import React, { useState } from 'react';
import { Button, Input, Loader, Message, Modal } from 'semantic-ui-react';
import { getUploadUrl, uploadFile } from '../api/user-api';
import { getIdToken } from '../auth/Auth';
import { User } from '../types/User';

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

const messages = {
  [UploadState.NoUpload]: "",
  [UploadState.FetchingPresignedUrl]: "Uploading image metadata",
  [UploadState.UploadingFile]: "Uploading file",
}

interface EditUserProps {
  user?: User;
  isOpen?: boolean;
  onClose?: any;
  onSubmit?: any;
}

export default function EditUser(props: EditUserProps) {
  const [file, setFile] = useState<any>(undefined);
  const [uploadState, setUploadState] = useState<UploadState>(UploadState.NoUpload);
  const { isOpen, user, onClose } = props;

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

      if (!user?.userId) {
        alert('User should be selected');
        return;
      }

      setUploadState(UploadState.FetchingPresignedUrl);
      const uploadUrl = await getUploadUrl(getIdToken(), user.userId);

      setUploadState(UploadState.UploadingFile);
      await uploadFile(uploadUrl, file);

      onClose && onClose(true);
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message);
    } finally {
      setUploadState(UploadState.NoUpload);
    }
  };

  return (
    <Modal open={isOpen}>
      < Modal.Header > {user?.name}</Modal.Header >
      <Modal.Content>
        <Modal.Description>
          {uploadState === UploadState.NoUpload
            ? <div>
              Image to upload
              <br />
              <br />
            </div>
            : <Message>
              {messages[uploadState] || ""}
            </Message>
          }
          <Input type="file" accept="image/*" placeholder="Image to upload" onChange={handleFileChange} />
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button color='black' onClick={() => onClose(false)}>
          Close
        </Button>
        <Button positive disabled={!file || uploadState !== UploadState.NoUpload}
          icon={uploadState === UploadState.NoUpload
            ? 'cloud upload'
            : {
              children: (Component, componentProps) =>
                <Component {...componentProps} color='red' style={{ padding: '3px' }}>
                  <Loader indeterminate active inline="centered" style={{ padding: '3px' }} />
                </Component>
            }}
          labelPosition='right'
          content='Upload'
          onClick={handleSubmit}
        />
      </Modal.Actions>
    </Modal >
  );
};