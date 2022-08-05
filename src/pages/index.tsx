import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import UploadIcon from "@mui/icons-material/Upload";
import Dropzone from "react-dropzone";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";
import React, { useState } from "react";
import { LoadingButton } from "@mui/lab";
import SendIcon from "@mui/icons-material/Send";
import Divider from "@mui/material/Divider";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ResultModal from "../components/Modals/ResultModal";
import { maxFileSize } from "../constants/constants";
import { DatePicker } from "@mui/x-date-pickers";
import moment from "moment";

interface UploadValues {
  sector: string;
  partner: string;
  watch: number;
  files: File[];
  date: Date;
}

const UploadSchema = Yup.object().shape({
  sector: Yup.string().required("Выберите участок"),
  partner: Yup.string().required("Выберите контрагента"),
  watch: Yup.number().required("Выберите вахту").min(1, "Выберите вахту"),
  files: Yup.array().min(1, "Необходимо загрузить минимум 1 файл"),
  date: Yup.date().required("Выберите дату"),
});

type IContent = {
  message: string;
  description?: string;
  files?: string[];
};

export type IModal = {
  type: "success" | "error";
  visible: boolean;
  content: IContent;
};

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modal, setModal] = useState<IModal>({
    type: "success",
    visible: false,
    content: { message: "", files: [], description: "" },
  });

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Байт", "КБ", "МБ", "ГБ", "ТБ"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const initialValues: UploadValues = {
    sector: "",
    partner: "",
    watch: 0,
    files: [],
    date: new Date(),
  };

  const submitFiles = async (values: UploadValues) => {
    const formData = new FormData();

    let key: keyof UploadValues;
    for (key in values) {
      if (values[key] instanceof Array) {
        //@ts-ignore
        for (let i = 0; i < values[key].length; i++) {
          //@ts-ignore
          formData.append(key, values[key][i]);
        }
      } else {
        formData.append(key, values[key].toString());
      }
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.status >= 400) {
        throw new Error(data.message);
      }
      setModal({ content: data, visible: true, type: "success" });
    } catch (e: any) {
      setModal({
        content: { message: e.message },
        visible: true,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <ResultModal
        modal={modal}
        handleClose={() => {
          setModal({ ...modal, visible: false });
        }}
      />
      <Formik
        initialValues={initialValues}
        validationSchema={UploadSchema}
        onSubmit={async (values, { resetForm }) => {
          setIsLoading(true);
          await submitFiles(values);
          resetForm();
        }}
        validateOnMount={true}
      >
        {({
          errors,
          values,
          touched,
          handleChange,
          setFieldValue,
          dirty,
          isValid,
        }) => (
          <Form>
            <Stack
              direction="row"
              justifyContent={"space-between"}
              divider={<Divider orientation="vertical" flexItem />}
              spacing={2}
            >
              <div style={{ width: "100%" }}>
                <h1>Трудовые ресурсы</h1>
                <DatePicker
                  views={["month", "year"]}
                  value={moment(values.date)}
                  onChange={(date) => setFieldValue("date", date)}
                  label="Дата трудового ресурса"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      helperText={
                        Boolean(errors.sector)
                          ? "Выберите месяц и год"
                          : "Выбранный месяц и год"
                      }
                      error={Boolean(errors.date)}
                      sx={{ m: 1 }}
                    />
                  )}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    "& > :not(style)": { m: 1 },
                  }}
                >
                  <TextField
                    error={Boolean(errors.sector)}
                    helperText={
                      Boolean(errors.sector)
                        ? "Выберите название участка"
                        : "Выбранный участок"
                    }
                    select
                    fullWidth
                    id="sector"
                    name="sector"
                    value={values.sector}
                    label="Участок"
                    onChange={handleChange}
                  >
                    <MenuItem value={"Участок 1"}>Участок 1</MenuItem>
                    <MenuItem value={"Участок 2"}>Участок 2</MenuItem>
                    <MenuItem value={"Участок 3"}>Участок 3</MenuItem>
                  </TextField>
                  <TextField
                    helperText={
                      Boolean(errors.partner)
                        ? "Выберите контрагента"
                        : "Выбранный контрагент"
                    }
                    select
                    fullWidth
                    id="partner"
                    name="partner"
                    value={values.partner}
                    label="Контрагент"
                    onChange={handleChange}
                    error={Boolean(errors.partner)}
                  >
                    <MenuItem value={"Контрагент 1"}>Контрагент 1</MenuItem>
                    <MenuItem value={"Контрагент 2"}>Контрагент 2</MenuItem>
                    <MenuItem value={"Контрагент 3"}>Контрагент 3</MenuItem>
                  </TextField>
                </Box>
                <FormControl
                  error={Boolean(errors.watch)}
                  sx={{ m: 1, width: "100%" }}
                >
                  <FormLabel id="watch">Вахта</FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="watch"
                    name="watch"
                    value={values.watch}
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      value="1"
                      control={<Radio />}
                      label="Первая"
                    />
                    <FormControlLabel
                      value="2"
                      control={<Radio />}
                      label="Вторая"
                    />
                  </RadioGroup>
                  {errors.watch ? (
                    <FormHelperText>{errors.watch}</FormHelperText>
                  ) : null}
                </FormControl>
              </div>
              <div style={{ width: "100%" }}>
                <Dropzone
                  maxSize={maxFileSize}
                  onDrop={(acceptedFiles) =>
                    setFieldValue("files", [...values.files, ...acceptedFiles])
                  }
                  onDropRejected={(files) => {
                    console.log(files);

                    return setModal({
                      type: "error",
                      content: {
                        message: "Большой размер файла",
                        description: `Файл ${files.map(
                          ({ file }) => `${file.name} `
                        )} слишком большой. Максимальный разрешенный размер ${formatBytes(
                          maxFileSize
                        )}`,
                      },
                      visible: true,
                    });
                  }}
                >
                  {({ getRootProps, getInputProps, acceptedFiles }) => (
                    <section>
                      <div
                        {...getRootProps()}
                        className={styles["input-container"]}
                      >
                        <Button variant="outlined" startIcon={<UploadIcon />}>
                          Загрузить
                        </Button>
                        <input {...getInputProps()} />
                        <p style={{ marginLeft: "10px" }}>
                          или перетащите файлы для <b>загрузки</b>
                        </p>
                      </div>
                      <aside>
                        {values.files.length ? (
                          <>
                            <h2>Загружаемые файлы</h2>
                            <ul className={styles["files-list"]}>
                              {values.files.map((file) => (
                                <>
                                  <li
                                    key={file.name}
                                    className={styles["files-list-item"]}
                                  >
                                    <div className={styles["files-list-item"]}>
                                      <InsertDriveFileOutlinedIcon />
                                      {file.name}, {formatBytes(file.size)}{" "}
                                    </div>

                                    <Tooltip
                                      placement="left"
                                      title={`Удалить файл ${file.name} из списка`}
                                      arrow
                                    >
                                      <IconButton
                                        aria-label="delete"
                                        onClick={() => {
                                          const newFiles = [...values.files];

                                          newFiles.splice(
                                            newFiles.indexOf(file),
                                            1
                                          );

                                          setFieldValue("files", newFiles);
                                        }}
                                      >
                                        <CloseIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </li>
                                </>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <p style={{ color: "#d32f2f" }}>
                            {errors.files?.toString()}
                          </p>
                        )}
                      </aside>
                    </section>
                  )}
                </Dropzone>
              </div>
            </Stack>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              <LoadingButton
                size="large"
                loading={isLoading}
                sx={{ m: 1 }}
                variant="outlined"
                type="submit"
                endIcon={<SendIcon />}
                loadingPosition="end"
                disabled={!isValid}
              >
                Отправить
              </LoadingButton>
            </Box>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Home;
