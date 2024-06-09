import alt from 'alt-client';
import * as native from 'natives';

import { useTranslate } from '@Shared/translate.js';
import '../translate/index.js';
const { t } = useTranslate('en');


import { SYSTEM_EVENTS } from '../shared/events.js';

const timeBetweenPlayerUpdates = 250;
let nextUpdate = Date.now() + 50;
let tick: number = null;
let noclipCam: number = null;
let sensitivity = 0.15;
let sensMultiplier = 5;

const NoClip = {
    init(entity: alt.Entity, key: string, value: any | boolean) {
        if (entity !== alt.Player.local) {
            return;
        }

        if (key !== 'NoClipping') {
            return;
        }

        if (value) {
            NoClip.enable();
        } else {
            NoClip.disable();
        }
    },

    enable() {
        tick = alt.everyTick(NoClip.tick);
        sensMultiplier = 5;

        const gameplayCamPos = native.getGameplayCamCoord();
        const gameplayCamRot = native.getGameplayCamRot(2);

        noclipCam = native.createCamWithParams(
            'DEFAULT_SCRIPTED_CAMERA',
            gameplayCamPos.x,
            gameplayCamPos.y,
            gameplayCamPos.z,
            0.0,
            0.0,
            gameplayCamRot.z,
            native.getGameplayCamFov(),
            false,
            2,
        );

        native.setCamActiveWithInterp(noclipCam, native.getRenderingCam(), 500, 0, 0);
        native.renderScriptCams(true, true, 500, true, false, 0);
        native.freezeEntityPosition(alt.Player.local.scriptID, true);
        native.setEntityInvincible(alt.Player.local.scriptID, true);

    },

    disable() {
        alt.clearEveryTick(tick);

        noclipCam = null;
        native.renderScriptCams(false, true, 500, true, false, 0);

        const position = native.getEntityCoords(alt.Player.local.scriptID, true);
        let [unk, ground] = native.getGroundZFor3dCoord(position.x, position.y, position.z, 0.0, false, false);
        native.setEntityCoordsNoOffset(alt.Player.local.scriptID, position.x, position.y, ground, false, false, false);
        native.freezeEntityPosition(alt.Player.local.scriptID, false);
        native.setEntityInvincible(alt.Player.local.scriptID, false);

    },

    tick() {
        native.disableControlAction(0, 1, true);
        native.disableControlAction(0, 2, true);
        native.disableControlAction(0, 14, true);
        native.disableControlAction(0, 15, true);
        native.disableControlAction(0, 24, true);
        native.disableControlAction(0, 25, true);
        native.disableControlAction(0, 30, true);
        native.disableControlAction(0, 31, true);
        native.disableControlAction(0, 49, true);

        const pos = native.getCamCoord(noclipCam);
        const rot = native.getCamRot(noclipCam, 2);

        const dir = new DirectionVector(pos, rot);
        const fwd = dir.forward(3.5);
        const sens = NoClip.getSensitivity();

        // native.setEntityCoords(alt.Player.local.scriptID, fwd.x, fwd.y, fwd.z - 2.0, true, false, false, true);

        if (alt.gameControlsEnabled() === false) {
            return;
        }

        // Scroll Up - Increase Multiplier
        if (native.isDisabledControlPressed(0, 15)) {
            sensMultiplier += 2;

            alt.log(sensMultiplier);

            if (sensMultiplier >= 100) {
                sensMultiplier = 100;
            }
        }

        // Scroll Down - Decrease Multiplier
        if (native.isDisabledControlPressed(0, 14)) {
            sensMultiplier -= 2;

            alt.log(sensMultiplier);

            if (sensMultiplier <= 2) {
                sensMultiplier = 2;
            }
        }

        // 'W' and 'D'
        if (native.isDisabledControlPressed(0, 32) && native.isDisabledControlPressed(0, 30)) {
            const forward = dir.forward(sens);
            const right = dir.right(sens);

            const finishedPos = {
                x: (forward.x + right.x) / 2,
                y: (forward.y + right.y) / 2,
                z: (forward.z + right.z) / 2,
            };

            native.setCamCoord(noclipCam, finishedPos.x, finishedPos.y, finishedPos.z);
        }

        // 'W' and 'A'
        else if (native.isDisabledControlPressed(0, 32) && native.isDisabledControlPressed(0, 34)) {
            const forward = dir.forward(sens);
            const left = dir.right(-sens);

            const finishedPos = {
                x: (forward.x + left.x) / 2,
                y: (forward.y + left.y) / 2,
                z: (forward.z + left.z) / 2,
            };

            native.setCamCoord(noclipCam, finishedPos.x, finishedPos.y, finishedPos.z);
        }

        // 'S' and 'D'
        else if (native.isDisabledControlPressed(0, 33) && native.isDisabledControlPressed(0, 30)) {
            const back = dir.forward(-sens);
            const right = dir.right(sens);

            const finishedPos = {
                x: (back.x + right.x) / 2,
                y: (back.y + right.y) / 2,
                z: (back.z + right.z) / 2,
            };

            native.setCamCoord(noclipCam, finishedPos.x, finishedPos.y, finishedPos.z);
        }

        // 'S' and 'A'
        else if (native.isDisabledControlPressed(0, 33) && native.isDisabledControlPressed(0, 34)) {
            const back = dir.forward(-sens);
            const left = dir.right(-sens);

            const finishedPos = {
                x: (back.x + left.x) / 2,
                y: (back.y + left.y) / 2,
                z: (back.z + left.z) / 2,
            };

            native.setCamCoord(noclipCam, finishedPos.x, finishedPos.y, finishedPos.z);
        } else {
            let direction = null;

            if (native.isDisabledControlPressed(0, 32)) {
                direction = dir.forward(sens);
            }

            if (native.isDisabledControlPressed(0, 33)) {
                direction = dir.forward(-sens);
            }

            if (native.isDisabledControlPressed(0, 34)) {
                direction = dir.right(-sens);
            }

            if (native.isDisabledControlPressed(0, 30)) {
                direction = dir.right(sens);
            }

            if (direction !== null) {
                native.setCamCoord(noclipCam, direction.x, direction.y, direction.z);
            }
        }

        if (Date.now() > nextUpdate) {
            nextUpdate = Date.now() + timeBetweenPlayerUpdates;
            alt.emitServer(SYSTEM_EVENTS.NOCLIP_UPDATE, fwd);
        }

        drawText2D(
            t('noclip.info'),
            { x: 0.5, y: 0.89 },
            0.4,
            new alt.RGBA(255, 255, 255, 200),
            0,
        );

        drawText2D(
            t('noclip.speed') + sens.toFixed(2) ,
            { x: 0.5, y: 0.92 },
            0.4,
            new alt.RGBA(255, 255, 255, 200),
            0,
        );

        if (!native.isPauseMenuActive()) {
            NoClip.processCameraRotation();
        }
    },

    // Noclip functions
    processCameraRotation() {
        const camRot = native.getCamRot(noclipCam, 2);
        const mouseX = native.getDisabledControlNormal(1, 1);
        const mouseY = native.getDisabledControlNormal(1, 2);

        const mouseSens = native.getProfileSetting(13);

        let finalRot = {
            x: camRot.x - mouseY * mouseSens,
            y: camRot.y,
            z: camRot.z - mouseX * mouseSens,
        };

        if (finalRot.x >= 89) {
            finalRot.x = 89;
        }

        if (finalRot.x <= -89) {
            finalRot.x = -89;
        }

        native.setCamRot(noclipCam, finalRot.x, finalRot.y, finalRot.z, 2);
        native.setEntityRotation(alt.Player.local.scriptID, finalRot.x, finalRot.y, finalRot.z, 2, true);
        native.forceCameraRelativeHeadingAndPitch(finalRot.x, finalRot.y, finalRot.z);
        native.setRadarZoom(0);
    },

    getSensitivity(): number {
        let currentSens = sensitivity;

        // Left Shift
        if (native.isDisabledControlPressed(0, 21)) {
            // 'E' Key
            if (native.isDisabledControlPressed(0, 38)) {
                currentSens *= sensMultiplier;
            }

            return (currentSens *= sensMultiplier);
        }

        // Left Ctrl
        if (native.isDisabledControlPressed(0, 36)) {
            return (currentSens = 0.035);
        }

        return currentSens;
    },
};

alt.on('syncedMetaChange', NoClip.init);

class DirectionVector {
    private position: alt.IVector3;
    private rotation: alt.IVector3;

    constructor(position: alt.IVector3, rotation: alt.IVector3) {
        this.position = position;
        this.rotation = rotation;
    }

    eulerToQuaternion(rotation: alt.IVector3) {
        const roll = rotation.x * (Math.PI / 180.0);
        const pitch = rotation.y * (Math.PI / 180.0);
        const yaw = rotation.z * (Math.PI / 180.0);

        const qx =
            Math.sin(roll / 2) * Math.cos(pitch / 2) * Math.cos(yaw / 2) -
            Math.cos(roll / 2) * Math.sin(pitch / 2) * Math.sin(yaw / 2);
        const qy =
            Math.cos(roll / 2) * Math.sin(pitch / 2) * Math.cos(yaw / 2) +
            Math.sin(roll / 2) * Math.cos(pitch / 2) * Math.sin(yaw / 2);
        const qz =
            Math.cos(roll / 2) * Math.cos(pitch / 2) * Math.sin(yaw / 2) -
            Math.sin(roll / 2) * Math.sin(pitch / 2) * Math.cos(yaw / 2);
        const qw =
            Math.cos(roll / 2) * Math.cos(pitch / 2) * Math.cos(yaw / 2) +
            Math.sin(roll / 2) * Math.sin(pitch / 2) * Math.sin(yaw / 2);

        return { x: qx, y: qy, z: qz, w: qw };
    }

    forwardVector(): alt.IVector3 {
        const quatRot = this.eulerToQuaternion(this.rotation);
        const fVectorX = 2 * (quatRot.x * quatRot.y - quatRot.w * quatRot.z);
        const fVectorY = 1 - 2 * (quatRot.x * quatRot.x + quatRot.z * quatRot.z);
        const fVectorZ = 2 * (quatRot.y * quatRot.z + quatRot.w * quatRot.x);

        return new alt.Vector3({ x: fVectorX, y: fVectorY, z: fVectorZ });
    }

    forward(distance: number): alt.IVector3 {
        const forwardVector = this.forwardVector();

        return new alt.Vector3({
            x: this.position.x + forwardVector.x * distance,
            y: this.position.y + forwardVector.y * distance,
            z: this.position.z + forwardVector.z * distance,
        });
    }

    rightVector() {
        const quatRot = this.eulerToQuaternion(this.rotation);

        const rVectorX = 1 - 2 * (quatRot.y * quatRot.y + quatRot.z * quatRot.z);
        const rVectorY = 2 * (quatRot.x * quatRot.y + quatRot.w * quatRot.z);
        const rVectorZ = 2 * (quatRot.x * quatRot.z - quatRot.w * quatRot.y);

        return new alt.Vector3({ x: rVectorX, y: rVectorY, z: rVectorZ });
    }

    right(distance: number) {
        const rightVector = this.rightVector();

        return new alt.Vector3({
            x: this.position.x + rightVector.x * distance,
            y: this.position.y + rightVector.y * distance,
            z: this.position.z + rightVector.z * distance,
        });
    }

    upVector() {
        const quatRot = this.eulerToQuaternion(this.rotation);
        const uVectorX = 2 * (quatRot.x * quatRot.z + quatRot.w * quatRot.y);
        const uVectorY = 2 * (quatRot.y * quatRot.z - quatRot.w * quatRot.x);
        const uVectorZ = 1 - 2 * (quatRot.x * quatRot.x + quatRot.y * quatRot.y);

        return new alt.Vector3({ x: uVectorX, y: uVectorY, z: uVectorZ });
    }

    up(distance: number) {
        const upVector = this.upVector();

        return new alt.Vector3({
            x: this.position.x + upVector.x * distance,
            y: this.position.y + upVector.y * distance,
            z: this.position.z + upVector.z * distance,
        });
    }
}

function drawText2D(
    text: string,
    pos: alt.IVector2,
    scale: number,
    color: alt.RGBA,
    alignment: number = 0,
    padding: number = 0,
) {
    if (scale > 2) {
        scale = 2;
    }

    native.clearDrawOrigin();
    native.beginTextCommandDisplayText('STRING');
    native.addTextComponentSubstringPlayerName(text);
    native.setTextFont(4);
    native.setTextScale(1, scale);
    native.setTextColour(color.r, color.g, color.b, color.a);
    native.setTextOutline();
    native.setTextDropShadow();
    if (alignment !== null) {
        native.setTextWrap(padding, 1 - padding);
        native.setTextJustification(alignment);
    }

    native.endTextCommandDisplayText(pos.x, pos.y, 0);
}