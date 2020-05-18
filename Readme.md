![](img/logo.jpg)

## What is it?

Minimal fake API server based on faker.js and unsplash.com

## Why should you use it?

To fake backend before its made and start frontend development just after project planning.

## How it works?

![](img/fakerserver.gif)

## How to use it?

After making post request with json argument

```json
[
    {
      "name": "name.firstName",
      "surname": "name.lastName",
      "mail": "internet.email",
      "profilePhoto": "internet.avatar",
      "animalPhoto": "image.dog"
    },
    "@repeat:1"
]
```

it returns

```json
[
    {
        "animalPhoto": "https://source.unsplash.com/200x200/?cat",
        "profilePhoto": "https://s3.amazonaws.com/uifaces/faces/twitter/gu5taf/128.jpg",
        "mail": "Bernhard_Bradtke@hotmail.com",
        "surname": "Schaefer",
        "name": "Madelynn"
    },
    {
        "animalPhoto": "https://source.unsplash.com/200x200/?dog",
        "profilePhoto": "https://s3.amazonaws.com/uifaces/faces/twitter/Elt_n/128.jpg",
        "mail": "Eula_Spencer24@gmail.com",
        "surname": "Herzog",
        "name": "Lempi"
    }
]
```

Ant these 2 photos looks like

![](https://source.unsplash.com/200x200/?cat)

![](https://source.unsplash.com/200x200/?dog)


### Directives are also available for use:
`@key` - use the name from the key to generate a value from, usage:
```
    {
        "name": "@key"
    }

    returns, ex:

    {
        "name": "<generated value (random method from name collection)>"
    }
```
`@repeat` - only for lists, replicates the object in a specified number of times, usage:
```
[
    {
        "name": "name.firstName"
    },
    "@repeat:1"
]

returns, ex:
[
    {
        "name": "Alice"
    },
    {
        "name": "Dennor"
    }
]
```
`@static` - determines that the generated value is consistent for all objects, usage:
```
[
    {
        "name": "@static:name.firstName", (or name.firstname@static)
        "surname": "name.lastName"
    },
    "@repeat:1"
]

returns, ex:
[
    {
        "name": "Connor"
        "surname": "Json"
    },
    {
        "name": "Connor",
        "surname": "Kowalsky"
    }
]
```
`@settings` - generation settings.
- data - source of static data for `@data` directive
- definitions - reusable fake definitions for `@use` direective
- root - if `true`, value under rootValue is treated as output root

`@data` - directive for static data

`@use` - takes reusable definitions from `@settings

complete example:
```
{
	"@settings": {
		"data": {
			"name": "Michal"
		},
		"definitions": {
            "photo": {
				"dateTaken": "@static:date.pas",
				"url": "image.girl.640.480",
				"placeLat": "addrss.latitu",
				"placeLong": "address.longitude"
			}
        },
        "root": true
	},
	"out": [
		{
            "commerce": "@key",
            "name": "@data:name",
			"address": {
				"street": "address.streetName",
				"city": "adess.secondyAddss"
            },
            "date": "date.past",
			"avatar": "shpe.circ",
			"photos": [
				"1@repeat,@use:photo"
            ]
		},
		"@repeat:1"
    ]
}

returns, ex:

[
    {
        "commerce": "Generic Steel Ball",
        "name": "Michal",
        "address": {
            "street": "Bins Street",
            "city": "Apt. 373"
        },
        "date": "2020-02-04T12:36:22.679Z",
        "avatar": "<svg height=\"98\" width=\"98\"><circle cx=\"49\"    cy=\"49\" r=\"49\" stroke=\"#00ff00\" stroke-width=\"4\"        fill=\"#00ff00\"/></svg>",
        "photos": [
            {
                "dateTaken": "2016-01-06T18:53:55.060Z",
                "url": "https://source.unsplash.com/640x480/?girl",
                "placeLat": "33.2601",
                "placeLong": "144.7978"
            },
            {
                "dateTaken": "2016-01-06T18:53:55.060Z",
                "url": "https://source.unsplash.com/640x480/?girl",
                "placeLat": "1.3206",
                "placeLong": "128.1190"
            }
        ]
    },
    {
        "commerce": "604.00",
        "name": "Michal",
        "address": {
            "street": "Ophelia Manors",
            "city": "Apt. 499"
        },
        "date": "2019-11-15T08:59:17.824Z",
        "avatar": "<svg height=\"166\" width=\"166\"><circle cx=\"83\"  cy=\"83\" r=\"83\" stroke=\"rgba(0, 255, 200, 0.5)\" stroke-width=\"15\" fill=\"red\"/></svg>",
        "photos": [
            {
                "dateTaken": "2016-01-06T18:53:55.060Z",
                "url": "https://source.unsplash.com/640x480/?girl",
                "placeLat": "-83.2634",
                "placeLong": "-36.3521"
            },
            {
                "dateTaken": "2016-01-06T18:53:55.060Z",
                "url": "https://source.unsplash.com/640x480/?girl",
                "placeLat": "22.2511",
                "placeLong": "2.0486"
            }
        ]
    }
]
```

### Some examples of arguments to JSON

| Key                 |            Result           |
| ---                 |             :---:           |
| address.zipCode     | 73318                       |
| commerce.department | Toys                        |
| company.companyName | Grant Group                 |
| database.type       | text                        |
| date.future         | 2016-12-12T14:50:49.361Z    |
| lorem.words         | itaque nostrum molestiae    |

Learn more about arguments that can be passed in JSON in [Faker.js Repo](https://github.com/marak/Faker.js/).


## Installation

Clone this repo and run

```
npm install
npm run build
```

## Run development server

```
npm run dev
```

## Run production server

```
npm run start
```

or using docker image

```
docker run -d -p 3000:3000 slothking/ts-api-faker
```

## Build

```
npm run build
```



## Contribute

Feel free to contact us and contribute. aexol@aexol.com

1.  fork this repo
2.  Create your feature branch: git checkout -b feature-name
3.  Commit your changes: git commit -am 'Add some feature'
4.  Push to the branch: git push origin my-new-feature
5.  Submit a pull request

