import * as faker from "faker";
import { json, createError } from "micro";
import { ServerResponse, IncomingMessage } from "http";
import getRandomShape from "./getRandomShape";

type DictOrString = {
  [x: string]: string | DictOrString | DictOrString[];
};

type DictOrArray = DictOrString | DictOrString[];

const resolveImages = ({
  name,
  width,
  height
}: {
  name: keyof typeof faker["image"];
  width: number;
  height: number;
}) => {
  switch (name) {
    case "dataUri":
      return faker.image.dataUri(width, height);
      break;
    default:
      return `https://source.unsplash.com/${width}x${height}/?${name}`;
      break;
  }
};
// type ImageLib = Partial<{ [x in keyof typeof faker["image"]]: any }>;

faker.random.boolean();

function randomGender() {
  var genders = ["male", "female", "unset"];
  return genders[Math.floor(Math.random() * genders.length)];
}

function randomDate(): string {
  const now = new Date();
  const helper = new Date(2012, 0, 1);
  return new Date(
    helper.getTime() + Math.random() * (now.getTime() - helper.getTime())
  ).toISOString();
}

function iterateAllValuesFaker(dict: DictOrArray): DictOrArray {
  const newDict: DictOrString = {};
  const handleValue = (value: any) => {
    if (value === null) {
      return value;
    }
    if (typeof value === "string") {
      const [k, f, x, y] = value.split(".");
      if (k === "shape") {
        return getRandomShape(f);
      }
      if (k === "image") {
        let imageWidth = x || "200";
        let imageHeight = y || x || "200";
        return resolveImages({
          name: f as keyof typeof faker["image"],
          width: parseInt(imageWidth),
          height: parseInt(imageHeight)
        });
      }
      if (k === "gender") {
        return randomGender();
      }
      if (k === "date") {
        return randomDate();
      }
      if (!faker[k][f]) {
        return value;
      }
      return faker[k][f]();
    } else {
      return iterateAllValuesFaker(value);
    }
  };
  if (Array.isArray(dict)) {
    return dict.map(d => handleValue(d)) as DictOrArray;
  }
  for (var key of Object.keys(dict)) {
    const value = dict[key];
    newDict[key] = handleValue(value);
  }
  return newDict;
}

export const serveFakeData = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  res.setHeader("Access-Control-Max-Age", `${3600 * 24}`);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"].join(",")
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    [
      "X-Requested-With",
      "Access-Control-Allow-Origin",
      "X-HTTP-Method-Override",
      "Content-Type",
      "Authorization",
      "Accept"
    ].join(",")
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method.toUpperCase() === "OPTIONS") {
    return {};
  }
  try {
    return iterateAllValuesFaker((await json(req)) as DictOrString);
  } catch (error) {
    throw createError(500, error);
  }
};
