Tuktuk Screen Scrapper
<a href="https://teamcity.dekker.gdn/viewType.html?buildTypeId=Tuktuk_BuildDocker&guest=1">
<img src="https://teamcity.dekker.gdn/app/rest/builds/buildType:(id:Tuktuk_BuildDocker)/statusIcon"/>
</a>
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

---

StarCityGames prices scrapper
url: https://scg.dekker.gdn

## How to run

```bash
git clone https://github.com/Dekkee/tuktuk-scg-scrapper.git tuktuk-scg-scrapper
cd tuktuk-scg-scrapper

# install dependencies
yarn

# generate suggest index
yarn update-index

# build
docker-compose up -d
```
