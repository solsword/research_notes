%.html: %.md
	pandoc $< -o $@
