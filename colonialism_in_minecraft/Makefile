mcm.html: mcm.md sections/*
	pandoc --standalone \
		--include-in-header=../head.html \
		mcm.md \
		sections/intro.md \
		sections/colonialism.md \
		sections/mechanics.md \
		sections/accumulation.md \
		sections/terrain.md \
		sections/monsters.md \
		sections/villagers.md \
		sections/incentives.md \
		sections/conclusion.md \
	  --output=$@
