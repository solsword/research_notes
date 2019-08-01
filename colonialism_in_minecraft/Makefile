mcm.html: mcm.md refs.bib sections/*
	pandoc --standalone \
		--include-in-header=../head.html \
		--filter pandoc-citeproc \
		mcm.md \
		sections/intro.md \
		sections/mechanics.md \
		sections/colonialism.md \
		sections/accumulation.md \
		sections/terrain.md \
		sections/monsters.md \
		sections/villagers.md \
		sections/incentives.md \
		sections/conclusion.md \
	  --output=$@
