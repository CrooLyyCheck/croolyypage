# CrooLyyPage

Lekki landing page po polsku dla marki `CrooLyyPage`, przygotowany jako statyczna strona uruchamiana przez `docker compose` bez budowania wlasnego obrazu.

## Wybrana platforma

Do tego briefu najlepsza jest statyczna strona HTML/CSS/JS serwowana przez gotowy obraz `nginx:1.27-alpine`.

Dlaczego nie React:

- strona ma tylko dwie podstrony i bardzo proste interakcje
- nie trzeba procesu builda
- wszystko startuje od razu przez `docker compose`
- latwiej wdrozyc i utrzymac

## Uruchomienie

```bash
docker compose up -d
```

Po starcie strona bedzie dostepna pod adresem:

- `http://localhost:8080`
- `http://localhost:8080/kontakt/`

## Konfiguracja profili

Wszystkie najwazniejsze dane sa w pliku:

- `site/config.js`

Mozesz tam szybko podmienic:

- nazwe profilu
- login GitHub do podgladu profilu
- link do GitHub
- link do YouTube
- `youtubeEmbedUrl` do osadzenia konkretnego filmu
- adres e-mail
