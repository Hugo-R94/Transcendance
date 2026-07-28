/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   login.go                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ldescamp <ldescamp@learner.42.tech>        +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/07/28 00:20:18 by ldescamp          #+#    #+#             */
/*   Updated: 2026/07/28 02:25:17 by ldescamp         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

package user

import (
	"net/http"

	"github.com/Hugo-R94/Transcendance/backend/internal/models"
	"github.com/Hugo-R94/Transcendance/backend/internal/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (h *UserHandler) login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	var user models.User
	if err := h.db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid credential",
		})
		return
	}
	if !utils.CheckPasswordHash(req.Password, user.PassHash) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid credential",
		})
		return
	}
	genNewTokens(c, user, h)
}

func LoginUser(router *gin.RouterGroup, db *gorm.DB) {
	//Using UserHandler struct to pass the db in the method login
	h := &UserHandler{db: db}
	router.POST("/login", h.login)
}
