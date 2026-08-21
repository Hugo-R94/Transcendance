package gambling

import (
	"crypto/rand"
	"errors"
	"math/big"
	"strconv"
)

// ============================================================
// ROULETTE
// ============================================================

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

// ============================================================
// WINNING NUMBER
// ============================================================

func winningNumberGenerator() (int, error) {
	n, err := rand.Int(
		rand.Reader,
		big.NewInt(MaxRouletteNumber+1),
	)

	if err != nil {
		return 0, err
	}

	return int(n.Int64()), nil
}

// ============================================================
// SCRATCH
// ============================================================

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

// ============================================================
// COLOR
// ============================================================

type RouletteColor string

const (
	ColorRed   RouletteColor = "red"
	ColorBlack RouletteColor = "black"
)

// ============================================================
// NUMBER COLOR
// ============================================================

func getNumberColor(number int) RouletteColor {
	if redNumbers[number] {
		return ColorRed
	}

	return ColorBlack
}

// ============================================================
// BET VALIDATION
// ============================================================

func isValidTarget(target string) bool {
	if target == "red" ||
		target == "black" ||
		target == "odd" ||
		target == "even" {
		return true
	}

	number, err := strconv.Atoi(target)

	if err != nil {
		return false
	}

	return number >= 0 && number <= MaxRouletteNumber
}

// ============================================================
// MULTIPLIER
// ============================================================

func getNumberMultiplier(target string) int {
	if number, err := strconv.Atoi(target); err == nil {
		if number >= 0 && number <= MaxRouletteNumber {
			return 21
		}

		return 0
	}

	switch target {
	case "red", "black":
		return 2

	case "odd", "even":
		return 2
	}

	return 0
}

// ============================================================
// ODD / EVEN
// ============================================================

func isNumberOdd(number int) bool {
	return number%2 != 0
}

// ============================================================
// WINNING BET
// ============================================================

func isWinningBet(target string, winningNumber int) bool {
	switch target {

	case "red":
		return getNumberColor(winningNumber) == ColorRed

	case "black":
		return getNumberColor(winningNumber) == ColorBlack

	case "odd":
		// 0 n'est ni pair ni impair.
		if winningNumber == 0 {
			return false
		}

		return isNumberOdd(winningNumber)

	case "even":
		if winningNumber == 0 {
			return false
		}

		return !isNumberOdd(winningNumber)
	}

	number, err := strconv.Atoi(target)

	if err != nil {
		return false
	}

	return number == winningNumber
}

// ============================================================
// BET WIN
// ============================================================

func calculateBetWin(chip *Chip, winningNumber int) int {
	if chip == nil {
		return 0
	}

	if !isWinningBet(chip.Target, winningNumber) {
		return 0
	}

	multiplier := getNumberMultiplier(chip.Target)

	return chip.ChipValue * multiplier
}

func calculateFinalWin(
	chip *Chip,
	ticket *Ticket,
	winningNumber int,
) int {

	baseWin := calculateBetWin(chip, winningNumber)

	if baseWin == 0 {
		return 0
	}

	if ticket == nil {
		return baseWin
	}

	value := float64(baseWin) * (1 + ticket.Value)

	if value < 0 {
		return 0
	}

	return int(value)
}

// ============================================================
// SAFETY
// ============================================================

var _ = errors.New