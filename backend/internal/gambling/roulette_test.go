package gambling

import "testing"

func TestWinningNumberGenerator(t *testing.T) {
	for i := 0; i < 100; i++ {
		number, err := winningNumberGenerator()

		if err != nil {
			t.Fatal(err)
		}

		if number < 0 || number > MaxRouletteNumber {
			t.Fatalf("numéro invalide : %d", number)
		}
	}
}

func TestGetNumberColor(t *testing.T) {
	tests := []struct {
		number int
		color  RouletteColor
	}{
		{0, ColorWhite},
		{1, ColorRed},
		{2, ColorGreen},
		{3, ColorRed},
		{21, ColorRed},
	}

	for _, test := range tests {
		result := getNumberColor(test.number)

		if result != test.color {
			t.Errorf(
				"numéro %d : attendu %s, obtenu %s",
				test.number,
				test.color,
				result,
			)
		}
	}
}

func TestIsWinningBet(t *testing.T) {
	tests := []struct {
		target string
		number int
		wins   bool
	}{
		{"red", 1, true},
		{"red", 2, false},
		{"green", 2, true},
		{"white", 0, true},
		{"17", 17, true},
		{"17", 18, false},
		{"odd", 5, true},
		{"odd", 6, false},
		{"even", 6, true},
	}

	for _, test := range tests {
		result := isWinningBet(test.target, test.number)

		if result != test.wins {
			t.Errorf(
				"mise %s sur %d : attendu %v, obtenu %v",
				test.target,
				test.number,
				test.wins,
				result,
			)
		}
	}
}

func TestGetBetMultiplier(t *testing.T) {
	tests := []struct {
		target     string
		multiplier int
	}{
		{"17", 21},
		{"red", 2},
		{"green", 2},
		{"white", 2},
		{"odd", 2},
		{"even", 2},
		{"invalid", 0},
	}

	for _, test := range tests {
		result := getNumberMultiplier(test.target)

		if result != test.multiplier {
			t.Errorf(
				"mise %s : attendu x%d, obtenu x%d",
				test.target,
				test.multiplier,
				result,
			)
		}
	}
}

func TestGenerateScratchTicket(t *testing.T) {
	for i := 0; i < 100; i++ {
		ticket := generateScratchTicket()

		if ticket == nil {
			t.Fatal("le ticket ne devrait pas être nil")
		}

		if ticket.Type != "bonus" && ticket.Type != "malus" {
			t.Errorf("type de ticket invalide : %s", ticket.Type)
		}

		if ticket.Type == "bonus" && ticket.Value != 1.5 {
			t.Errorf("bonus attendu à 1.5, obtenu %f", ticket.Value)
		}

		if ticket.Type == "malus" && ticket.Value != -0.5 {
			t.Errorf("malus attendu à -0.5, obtenu %f", ticket.Value)
		}
	}
}