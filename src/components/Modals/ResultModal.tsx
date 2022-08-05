import { Box, Button, Modal, Typography } from "@mui/material";
import React from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { IModal } from "../../pages";

type Props = {
  modal: IModal;
  handleClose: Function;
};

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: 700,
  bgcolor: "background.paper",
  border: "1px solid #000",
  boxShadow: 24,
  display: "flex",
  p: 4,
  flexDirection: "column",
};

const ResultModal = ({ modal, handleClose }: Props) => {
  return (
    <Modal
      open={modal.visible}
      onClose={() => handleClose()}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {modal.type === "success" ? (
            <>
              <CheckCircleOutlineIcon
                sx={{ fontSize: 30, mr: 2 }}
                color="success"
              />
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Файлы успешно загружены
              </Typography>
            </>
          ) : (
            <>
              <ErrorOutlineOutlinedIcon
                sx={{ fontSize: 30, mr: 2 }}
                color="error"
              />
              <Typography id="modal-modal-title" variant="h6" component="h2">
                {modal.content.message}
              </Typography>
            </>
          )}
        </div>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          {modal.type === "success" ? (
            <>
              <ul>
                {modal.content?.files?.map((file, index) => (
                  <li key={index}>{file}</li>
                ))}
              </ul>
            </>
          ) : modal.content.description ? (
            <>{modal.content.description}</>
          ) : (
            <>Попробуйте снова</>
          )}
        </Typography>
        <Button sx={{ mt: 2 }} onClick={() => handleClose()} variant="outlined">
          Ок
        </Button>
      </Box>
    </Modal>
  );
};

export default ResultModal;
