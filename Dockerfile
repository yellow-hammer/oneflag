# Образ OneFlag: self-hosted сервис управления фича-флагами.
#
#   docker build -t oneflag:local .

FROM evilbeaver/onescript:latest

WORKDIR /oneflag

# Слой зависимостей меняется реже исходников, поэтому packagedef копируется первым
COPY packagedef ./packagedef
RUN opm install

COPY src ./src
COPY app ./app
COPY demo ./demo
COPY autumn-properties.json ./autumn-properties.json
COPY healthcheck.os ./healthcheck.os

# Хранилище выносится в том: иначе флаги исчезнут вместе с контейнером
RUN mkdir -p /oneflag/data
VOLUME ["/oneflag/data"]

ENV ONEFLAG_PORT=3333 \
    ONEFLAG_STORAGE_KIND=sqlite \
    ONEFLAG_STORAGE=/oneflag/data/oneflag.db

EXPOSE 3333

# Сервер готов, когда прочитал хранилище и отвечает на /healthz
HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=5 \
    CMD oscript /oneflag/healthcheck.os || exit 1

CMD ["oscript", "src/main.os", "serve"]
