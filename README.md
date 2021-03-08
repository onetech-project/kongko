# Kongko

Let's chat and build the network!!!

**Kongko** is a Web App for Chat that are built with NodeJS, ExpressJS, and Socket.IO.

## Prerequisites

- IDE (ie: VS CODE)
- Node JS
- Docker (for deployment)

## Run the project

1. Clone the project and enter the cloned repo folder
2. open .env file if you want to change the environtment variable and below is the content of this file

```
PORT=3000 *you can change with number you want
APPNAME=KONGKO *you can change with name you want
HOST=host.docker.internal *change to your host
```

3. Type this command below for installing dependencies

```
npm i
npm i --only=dev
```

4. Run the project by typing

```
npm run dev
```

5. Build for prod using docker

```
npm run build
```

OR

```
docker build -t <iamge name> . && docker run --name <app name> -dp 80:3000 <image name>
```

# Enjoy!
