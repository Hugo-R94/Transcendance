package gambling

import (
	"crypto/rand"
	"math/big"
	"strconv"
)

const MaxRouletteNumber = 21

var redNumbers = map[int]bool{
	1:  true,
	3:  true,
	5:  true,
	7:  true,
	9:  true,
	12: true,
	14: true,
	16: true,
	18: true,
	19: true,
	21: true,
}

func winningNumberGenerator() (int, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(MaxRouletteNumber+1))
	if err != nil {
		return 0, err
	}
	

	return int(n.Int64()), nil
}

func generateScratchTicket() *Ticket {
	n, err := rand.Int(rand.Reader, big.NewInt(2))
	if err != nil {
		return nil
	}

	if n.Int64() == 0 {
		return &Ticket{
			Type:  "bonus",
			Value: 1.5,
		}
	}

	return &Ticket{
		Type:  "malus",
		Value: -0.5,
	}
}

func getNumberMultiplier(target string) int {
	if number, err := strconv.Atoi(target); err == nil {
		if number >= 0 && number <= MaxRouletteNumber {
			return 21
		}

		return 0
	}

	switch target {
	case "red", "green", "white":
		return 2

	case "odd", "even":
		return 2
	}

	return 0
}

type RouletteColor string

const (
	ColorRed   RouletteColor = "red"
	ColorWhite RouletteColor = "white"
	ColorGreen RouletteColor = "green"
)

func getNumberColor(number int) RouletteColor {
	if number == 0 {
		return ColorWhite
	}

	if redNumbers[number] {
		return ColorRed
	}

	return ColorGreen
}

func isNumberOdd(number int) bool{
	return number % 2 != 0;
}

func isWinningBet(target string, winningNumber int) bool {
	if target == "red" || target == "green" || target == "white" {
		return string(getNumberColor(winningNumber)) == target
	}

	if target == "odd" {
		return isNumberOdd(winningNumber)
	}

	if target == "even"{
		return !isNumberOdd(winningNumber)
	}

	number, err := strconv.Atoi(target)
	if err != nil {
		return false
	}

	return number == winningNumber
}