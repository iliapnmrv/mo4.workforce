import formidable, { File } from "formidable";
import fs from "fs";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadValues {
  sector: string;
  partner: string;
  watch: number;
  date: Date;
}

const saveFile = async (file: File, values: UploadValues) => {
  const data = fs.readFileSync(file.filepath);

  const dir = `./uploads/${values.sector}/${values.partner}/${moment(
    values.date
  ).year()}_${("0" + (moment(values.date).month() + 1)).slice(-2)}/${
    values.watch
  }`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(`${dir}/${file.originalFilename}`, data);

  await fs.unlinkSync(file.filepath);
  return;
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const form = new formidable.IncomingForm({ multiples: true });
  //@ts-ignore
  form.parse(req, async (err, fields: UploadValues, { files }: File[]) => {
    if (!files) {
      return res.status(400).json({
        message: `Вы не загрузили файлы`,
      });
    }
    if (!Array.isArray(files)) {
      files = [files];
    }

    console.log("files", files);

    files.forEach(async (file: File) => {
      await saveFile(file, fields);
    });

    return res.status(201).json({
      message: `Файлы успешно загружены`,
      files: files.map((file: File) => file.originalFilename),
    });
  });
};

export default handler;
