import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, getStats, restoreUser, permanentDeleteUser, changePassword } from '../controllers/userController.js';
import { verifyToken, requireAdmin, requireOwnerOrAdmin } from '../middlewares/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos los usuarios
 *     description: Obtiene una lista de todos los usuarios registrados en el sistema. Solo admins pueden acceder.
 *     tags:
 *       - Usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Usuario no tiene permisos de admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.get('/', verifyToken, requireAdmin, getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener información de un usuario
 *     description: Obtiene los datos de un usuario específico. Los usuarios normales solo ven su propia información.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Datos del usuario obtenidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.get('/:id', verifyToken, requireOwnerOrAdmin, getUserById);

/**
 * @swagger
 * /api/users/{id}/stats:
 *   get:
 *     summary: Obtener estadísticas del usuario
 *     description: Obtiene estadísticas agregadas del usuario como total de juegos, pokémon capturados, etc
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "Ash"
 *                 total_games:
 *                   type: integer
 *                   example: 5
 *                 total_captured:
 *                   type: integer
 *                   example: 32
 *                 total_escaped:
 *                   type: integer
 *                   example: 8
 *                 unique_pokemon:
 *                   type: integer
 *                   example: 20
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.get('/:id/stats', verifyToken, requireOwnerOrAdmin, getStats);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar datos del usuario
 *     description: Actualiza información de un usuario (solo admin puede actualizar a otros usuarios)
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 15
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.put('/:id', verifyToken, requireOwnerOrAdmin, updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario (soft delete)
 *     description: Elimina un usuario de forma lógica (soft delete). El usuario se marca como eliminado pero sus datos quedan en la BD. Solo admin.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: No tiene permisos de admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:id', verifyToken, requireAdmin, deleteUser);

/**
 * @swagger
 * /api/users/{id}/me:
 *   delete:
 *     summary: El propio usuario borra su cuenta
 *     description: Permite al usuario autenticado eliminar permanentemente su propia cuenta y todos sus datos.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:id/me', verifyToken, async (req, res) => {
    // Solo el propio usuario puede borrar su cuenta
    if (String(req.user.id) !== String(req.params.id)) {
        return res.status(403).json({ error: 'No autorizado' });
    }
    try {
        const { permanentDeleteUser } = await import('../controllers/userController.js');
        await permanentDeleteUser(req, res);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * @swagger
 * /api/users/{id}/restore:
 *   put:
 *     summary: Restaurar usuario eliminado
 *     description: Restaura un usuario que fue eliminado con soft delete. Solo admin.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario restaurado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario restaurado"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: No tiene permisos de admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.put('/:id/restore', verifyToken, requireAdmin, restoreUser);

/**
 * @swagger
 * /api/users/{id}/permanent:
 *   delete:
 *     summary: Eliminar usuario permanentemente
 *     description: Elimina un usuario de forma permanente (hard delete). ADVERTENCIA - No se puede deshacer. Solo admin.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario eliminado permanentemente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado permanentemente"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: No tiene permisos de admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:id/permanent', verifyToken, requireAdmin, permanentDeleteUser);

/**
 * @swagger
 * /api/users/{id}/change-password:
 *   put:
 *     summary: Cambiar contraseña
 *     description: Cambia la contraseña de un usuario. Solo admin puede cambiar contraseñas.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_password:
 *                 type: string
 *                 minLength: 6
 *                 example: "newPassword123"
 *             required:
 *               - new_password
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contraseña actualizada correctamente"
 *       400:
 *         description: Contraseña no cumple requisitos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: No tiene permisos de admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.put('/:id/change-password', verifyToken, requireAdmin, changePassword);

export default router;