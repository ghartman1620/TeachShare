FROM golang:1.9.2-alpine3.7

# Need git for dep
RUN apk add --no-cache git

# Need dep to get dependencies
# RUN go get github.com/golang/dep/cmd/dep

# Copy current dir (outside docker) to the proper directory (inside docker)
COPY ./serve.go src/github.com/ghartman1620/fileserv/serve.go

# Change current directory
WORKDIR src/github.com/ghartman1620/fileserv

# Get dependencies
# RUN dep ensure

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o serve .

# # Install assignment/code
# RUN go install .

FROM alpine:latest  
RUN apk --no-cache add ca-certificates
WORKDIR /
COPY --from=0 /go/src/github.com/ghartman1620/fileserv/serve .
COPY ./dist ./
CMD ["./serve"]

EXPOSE 8081