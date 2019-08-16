import * as faker from "faker";
import { buffer, createError } from "micro";
import { ServerResponse, IncomingMessage } from "http";
import getRandomShape from "./getRandomShape";
import { compare, keyMapObject } from "./levenshtein";
import { gunzip } from "zlib"

type DictOrString = {
  [x: string]: string | DictOrString | DictOrString[];
};

type DictOrArray = DictOrString | DictOrString[] | string;

const resolveImages = ({
  name,
  width,
  height
}: {
  name: string;
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
const imageTypes = ["image", "picture", "photo"];
const allKeys: keyMapObject[] = [
  "address",
  "commerce",
  "company",
  "database",
  "finance",
  "hacker",
  "helpers",
  "internet",
  "lorem",
  "name",
  "phone",
  "random",
  "system"
]
  .map(k =>
    Object.keys(faker[k]).map(fk => ({ name: `${k}.${fk}`, key: k, value: fk }))
  )
  .reduce((a, b) => [...a, ...b])
  .concat([
    {
      name: "image",
      value: "image",
      key: "image"
    },
    {
      name: "gender",
      value: "gender",
      key: "gender"
    },
    {
      name: "shape.circle",
      key: "shape",
      value: "circle"
    },
    {
      name: "shape.square",
      key: "shape",
      value: "square"
    },
    {
      name: "shape.triangle",
      key: "shape",
      value: "triangle"
    },
    {
      name: "shape.rectangle",
      key: "shape",
      value: "rectangle"
    }
  ]);
function iterateAllValuesFaker(dict: DictOrArray, key?: string): DictOrArray {
  const newDict: DictOrString = {};
  const handleValue = (value: any, key?: string) => {
    try {
      if (value === null) {
        return value;
      }
      switch (typeof value) {
        case "number":
          return value
        case "string":
          const [k, f, x, y] = value.split(".");
          // short path, if we have an exact
          // match for supplied value,
          // return it
          if (typeof (faker[k]) !== "undefined" && typeof (faker[k][f]) !== "undefined") {
            return faker[k][f]();
          }
          switch (k) {
            case "shape":
              return getRandomShape(f);
            case "image":
              let imageWidth = x || "200";
              let imageHeight = y || x || "200";
              let imageName = f || key || "image";
              return resolveImages({
                name: imageName,
                width: parseInt(imageWidth),
                height: parseInt(imageHeight)
              });
            case "gender":
              return randomGender();
            case "date":
              return randomDate();
            default:
              const [isImageType] = imageTypes.filter(i =>
                typeof key === "undefined" ? undefined : key.toLowerCase().match(i.toLowerCase())
              );
              if (isImageType) {
                return handleValue("image", key.toLowerCase().replace(isImageType, ""));
              }
              if (value === "String" || value === "string") {
                if (typeof key === "undefined") {
                  return faker.lorem.word()
                }
                return handleValue(compare(key, allKeys), key);
              }
              return value
          }
        default:
          return iterateAllValuesFaker(value);
      }
    } catch (e) {
      return `<<field could not be faked, reason: ${e.message}>>`
    }
  };
  if (typeof dict === "string") {
    return handleValue(dict, key)
  }
  if (Array.isArray(dict)) {
    return dict.map(d => handleValue(d, key)) as DictOrArray;
  }
  for (var key of Object.keys(dict)) {
    const value = dict[key];
    newDict[key] = handleValue(value, key);
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
      "Content-Encoding",
      "Authorization",
      "Accept"
    ].join(",")
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method.toUpperCase() === "OPTIONS") {
    return {};
  }
  try {
    return iterateAllValuesFaker(await buffer(req, { limit: "10mb" })
      .then(body => {
        switch (req.headers["content-encoding"]) {
          case "gzip":
            return new Promise<string>((resolve, reject) => {
              gunzip(body, (err, buf) => {
                if (err) {
                  reject(createError(400, "Invalid gzip", err))
                  return
                }
                resolve(buf.toString())
              })
            })
          default:
            return body.toString()
        }
      })
      .then(body => {
        try {
          return JSON.parse(body)
        } catch (err) {
          createError(400, "Invalid JSON", err)
        }
      })
    )
  } catch (error) {
    throw createError(500, error);
  }
};
