# CrooLyyPage

Lekki landing page po polsku dla marki `CrooLyyPage`, przygotowany jako statyczna strona uruchamiana przez `docker compose` bez budowania własnego obrazu.

## Wybrana platforma

Do tego briefu najlepsza jest statyczna strona HTML/CSS/JS serwowana przez gotowy obraz `nginx:1.27-alpine`.

Dlaczego nie React:

- strona ma tylko dwie podstrony i bardzo proste interakcje
- nie trzeba procesu builda
- wszystko startuje od razu przez `docker compose`
- łatwiej wdrożyć i utrzymać

## Uruchomienie

```bash
docker compose up -d
```

Po starcie strona będzie dostępna pod adresem:

- `http://localhost:8080`
- `http://localhost:8080/kontakt/`

## Konfiguracja profili

Wszystkie najważniejsze dane są w pliku:

- `site/config.js`

Możesz tam szybko podmienić:

- nazwę profilu
- link do GitHub
- link do YouTube
- adres e-mail
