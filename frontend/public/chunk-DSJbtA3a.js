import{$ as Om,$n as vw,Cn as l1,Ct as UI,Et as Vh,Fn as oD,Gn as u1,Ht as _u,It as Yn,J as Nh,Jn as ur,Jt as cI,Kt as bu,Ln as qI,Lt as ZI,Mn as ne$1,Mt as Xn,Ot as Wh,P as Ir,Pn as oC,Pt as Y,Qn as vu,Rn as qe,St as U,Un as ss,Ut as aw,X as OI,_t as Su,a as Ae,an as fe$1,ar as xd,bn as ki,cn as g1,ct as Rh,fn as h1,i as Ad,ir as xI,jt as Xh,kn as md,kt as Wi,nt as P,o as Ah,or as xh,ot as QI,p as C,q as ND,r as AI,rt as Ph,sn as g,st as RI,u as BI,ur as yd,vn as jh,xt as Tu,yn as kI}from"./chunk-ez20LXaH.js";import{A as ft,B as rr,D as dn,L as p,M as ir,N as j,P as ja,b as Vn,c as He,d as Mn,f as Nt,i as Ct,r as Bt,s as Gn,w as bi}from"./chunk-CPnaw6rc.js";import{S as wt,c as Ot,g as me$1,n as Dt,o as I,r as Et,x as vt}from"./main-5LPOYN3L.js";import{k as jn,u as Pn}from"./chunk-DM4HDBUx.js";import{n as Kt$1,t as Bt$1}from"./chunk-HseL7nRE.js";import{n as yt,t as wt$1}from"./chunk-BZrr8D4z.js";import{n as Z,t as L}from"./chunk-DhjL53Vl.js";var qt=[`tooltip`];var Qt=20;var Wt=new C(`mat-tooltip-scroll-strategy`,{providedIn:`root`,factory:()=>{let n=g(fe$1);return()=>Ot(n,{scrollThrottle:Qt})}});var Kt=new C(`mat-tooltip-default-options`,{providedIn:`root`,factory:()=>({showDelay:0,hideDelay:0,touchendHideDelay:1500})});var Gt=`tooltip-panel`;var Jt={passive:!0};var te=8;var ee=8;var ie=24;var ne=200;var jt=(()=>{class n{_elementRef=g(Yn);_ngZone=g(ne$1);_platform=g(p);_ariaDescriber=g(ja);_focusMonitor=g(Ct);_dir=g(Gn);_injector=g(fe$1);_viewContainerRef=g(Xn);_mediaMatcher=g(ft);_document=g(U);_renderer=g(ki);_animationsDisabled=j();_defaultOptions=g(Kt,{optional:!0});_overlayRef=null;_tooltipInstance=null;_overlayPanelClass;_portal;_position=`below`;_positionAtOrigin=!1;_disabled=!1;_tooltipClass;_viewInitialized=!1;_pointerExitEventsInitialized=!1;_tooltipComponent=oe;_viewportMargin=8;_currentPosition;_cssClassPrefix=`mat-mdc`;_ariaDescriptionPending=!1;_dirSubscribed=!1;get position(){return this._position}set position(t){t!==this._position&&(this._position=t,this._overlayRef&&(this._updatePosition(this._overlayRef),this._tooltipInstance?.show(0),this._overlayRef.updatePosition()))}get positionAtOrigin(){return this._positionAtOrigin}set positionAtOrigin(t){this._positionAtOrigin=bi(t),this._detach(),this._overlayRef=null}get disabled(){return this._disabled}set disabled(t){let e=bi(t);this._disabled!==e&&(this._disabled=e,e?this.hide(0):this._setupPointerEnterEventsIfNeeded(),this._syncAriaDescription(this.message))}get showDelay(){return this._showDelay}set showDelay(t){this._showDelay=dn(t)}_showDelay;get hideDelay(){return this._hideDelay}set hideDelay(t){this._hideDelay=dn(t),this._tooltipInstance&&(this._tooltipInstance._mouseLeaveHideDelay=this._hideDelay)}_hideDelay;touchGestures=`auto`;get message(){return this._message}set message(t){let e=this._message;this._message=t!=null?String(t).trim():``,!this._message&&this._isTooltipVisible()?this.hide(0):(this._setupPointerEnterEventsIfNeeded(),this._updateTooltipMessage()),this._syncAriaDescription(e)}_message=``;get tooltipClass(){return this._tooltipClass}set tooltipClass(t){this._tooltipClass=t,this._tooltipInstance&&this._setTooltipClass(this._tooltipClass)}_eventCleanups=[];_touchstartTimeout=null;_destroyed=new Y;_isDestroyed=!1;constructor(){let t=this._defaultOptions;t&&(this._showDelay=t.showDelay,this._hideDelay=t.hideDelay,t.position&&(this.position=t.position),t.positionAtOrigin&&(this.positionAtOrigin=t.positionAtOrigin),t.touchGestures&&(this.touchGestures=t.touchGestures),t.tooltipClass&&(this.tooltipClass=t.tooltipClass)),this._viewportMargin=te}ngAfterViewInit(){this._viewInitialized=!0,this._setupPointerEnterEventsIfNeeded(),this._focusMonitor.monitor(this._elementRef).pipe(Om(this._destroyed)).subscribe(t=>{t?t===`keyboard`&&this._ngZone.run(()=>this.show()):this._ngZone.run(()=>this.hide(0))})}ngOnDestroy(){let t=this._elementRef.nativeElement;this._touchstartTimeout&&clearTimeout(this._touchstartTimeout),this._overlayRef&&(this._overlayRef.dispose(),this._tooltipInstance=null),this._eventCleanups.forEach(e=>e()),this._eventCleanups.length=0,this._destroyed.next(),this._destroyed.complete(),this._isDestroyed=!0,this._ariaDescriber.removeDescription(t,this.message,`tooltip`),this._focusMonitor.stopMonitoring(t)}show(t=this.showDelay,e){if(this.disabled||!this.message||this._isTooltipVisible()){this._tooltipInstance?._cancelPendingAnimations();return}let i=this._createOverlay(e);this._detach(),this._portal=this._portal||new wt(this._tooltipComponent,this._viewContainerRef);let o=this._tooltipInstance=i.attach(this._portal).instance;o._triggerElement=this._elementRef.nativeElement,o._mouseLeaveHideDelay=this._hideDelay,o.afterHidden().pipe(Om(this._destroyed)).subscribe(()=>this._detach()),this._setTooltipClass(this._tooltipClass),this._updateTooltipMessage(),o.show(t)}hide(t=this.hideDelay){let e=this._tooltipInstance;e&&(e.isVisible()?e.hide(t):(e._cancelPendingAnimations(),this._detach()))}toggle(t){this._isTooltipVisible()?this.hide():this.show(void 0,t)}_isTooltipVisible(){return!!this._tooltipInstance&&this._tooltipInstance.isVisible()}_createOverlay(t){if(this._overlayRef){let a=this._overlayRef.getConfig().positionStrategy;if((!this.positionAtOrigin||!t)&&a._origin instanceof Yn)return this._overlayRef;this._detach()}let e=this._injector.get(I).getAncestorScrollContainers(this._elementRef),i=`${this._cssClassPrefix}-${Gt}`,o=Et(this._injector,this.positionAtOrigin?t||this._elementRef:this._elementRef).withTransformOriginOn(`.${this._cssClassPrefix}-tooltip`).withFlexibleDimensions(!1).withViewportMargin(this._viewportMargin).withScrollableContainers(e).withPopoverLocation(`global`);return o.positionChanges.pipe(Om(this._destroyed)).subscribe(a=>{this._updateCurrentPositionClass(a.connectionPair),this._tooltipInstance&&a.scrollableViewProperties.isOverlayClipped&&this._tooltipInstance.isVisible()&&this._ngZone.run(()=>this.hide(0))}),this._overlayRef=Dt(this._injector,{direction:this._dir,positionStrategy:o,panelClass:this._overlayPanelClass?[...this._overlayPanelClass,i]:i,scrollStrategy:this._injector.get(Wt)(),disableAnimations:this._animationsDisabled,eventPredicate:this._overlayEventPredicate}),this._updatePosition(this._overlayRef),this._overlayRef.detachments().pipe(Om(this._destroyed)).subscribe(()=>this._detach()),this._overlayRef.outsidePointerEvents().pipe(Om(this._destroyed)).subscribe(()=>this._tooltipInstance?._handleBodyInteraction()),this._overlayRef.keydownEvents().pipe(Om(this._destroyed)).subscribe(a=>{a.preventDefault(),a.stopPropagation(),this._ngZone.run(()=>this.hide(0))}),this._defaultOptions?.disableTooltipInteractivity&&this._overlayRef.addPanelClass(`${this._cssClassPrefix}-tooltip-panel-non-interactive`),this._dirSubscribed||(this._dirSubscribed=!0,this._dir.change.pipe(Om(this._destroyed)).subscribe(()=>{this._overlayRef&&this._updatePosition(this._overlayRef)})),this._overlayRef}_detach(){this._overlayRef&&this._overlayRef.hasAttached()&&this._overlayRef.detach(),this._tooltipInstance=null}_updatePosition(t){let e=t.getConfig().positionStrategy,i=this._getOrigin(),o=this._getOverlayPosition();e.withPositions([this._addOffset(P(P({},i.main),o.main)),this._addOffset(P(P({},i.fallback),o.fallback))])}_addOffset(t){let e=ee,i=!this._dir||this._dir.value==`ltr`;return t.originY===`top`?t.offsetY=-e:t.originY===`bottom`?t.offsetY=e:t.originX===`start`?t.offsetX=i?-e:e:t.originX===`end`&&(t.offsetX=i?e:-e),t}_getOrigin(){let t=!this._dir||this._dir.value==`ltr`,e=this.position,i;e==`above`||e==`below`?i={originX:`center`,originY:e==`above`?`top`:`bottom`}:e==`before`||e==`left`&&t||e==`right`&&!t?i={originX:`start`,originY:`center`}:(e==`after`||e==`right`&&t||e==`left`&&!t)&&(i={originX:`end`,originY:`center`});let{x:o,y:a}=this._invertPosition(i.originX,i.originY);return{main:i,fallback:{originX:o,originY:a}}}_getOverlayPosition(){let t=!this._dir||this._dir.value==`ltr`,e=this.position,i;e==`above`?i={overlayX:`center`,overlayY:`bottom`}:e==`below`?i={overlayX:`center`,overlayY:`top`}:e==`before`||e==`left`&&t||e==`right`&&!t?i={overlayX:`end`,overlayY:`center`}:(e==`after`||e==`right`&&t||e==`left`&&!t)&&(i={overlayX:`start`,overlayY:`center`});let{x:o,y:a}=this._invertPosition(i.overlayX,i.overlayY);return{main:i,fallback:{overlayX:o,overlayY:a}}}_updateTooltipMessage(){this._tooltipInstance&&(this._tooltipInstance.message=this.message,this._tooltipInstance._markForCheck(),oD(()=>{this._tooltipInstance&&this._overlayRef.updatePosition()},{injector:this._injector}))}_setTooltipClass(t){this._tooltipInstance&&(this._tooltipInstance.tooltipClass=t instanceof Set?Array.from(t):t,this._tooltipInstance._markForCheck())}_invertPosition(t,e){return this.position===`above`||this.position===`below`?e===`top`?e=`bottom`:e===`bottom`&&(e=`top`):t===`end`?t=`start`:t===`start`&&(t=`end`),{x:t,y:e}}_updateCurrentPositionClass(t){let{overlayY:e,originX:i,originY:o}=t,a;if(e===`center`?this._dir&&this._dir.value===`rtl`?a=i===`end`?`left`:`right`:a=i===`start`?`left`:`right`:a=e===`bottom`&&o===`top`?`above`:`below`,a!==this._currentPosition){let x=this._overlayRef;if(x){let W=`${this._cssClassPrefix}-${Gt}-`;x.removePanelClass(W+this._currentPosition),x.addPanelClass(W+a)}this._currentPosition=a}}_setupPointerEnterEventsIfNeeded(){this._disabled||!this.message||!this._viewInitialized||this._eventCleanups.length||(this._isTouchPlatform()?this.touchGestures!==`off`&&(this._disableNativeGesturesIfNecessary(),this._addListener(`touchstart`,t=>{let e=t.targetTouches?.[0],i=e?{x:e.clientX,y:e.clientY}:void 0;this._setupPointerExitEventsIfNeeded(),this._touchstartTimeout&&clearTimeout(this._touchstartTimeout);let o=500;this._touchstartTimeout=setTimeout(()=>{this._touchstartTimeout=null,this.show(void 0,i)},this._defaultOptions?.touchLongPressShowDelay??o)})):this._addListener(`mouseenter`,t=>{this._setupPointerExitEventsIfNeeded();let e;t.x!==void 0&&t.y!==void 0&&(e=t),this.show(void 0,e)}))}_setupPointerExitEventsIfNeeded(){if(!this._pointerExitEventsInitialized){if(this._pointerExitEventsInitialized=!0,!this._isTouchPlatform())this._addListener(`mouseleave`,t=>{let e=t.relatedTarget;(!e||!this._overlayRef?.overlayElement.contains(e))&&this.hide()}),this._addListener(`wheel`,t=>{if(this._isTooltipVisible()){let e=this._document.elementFromPoint(t.clientX,t.clientY),i=this._elementRef.nativeElement;e!==i&&!i.contains(e)&&this.hide()}});else if(this.touchGestures!==`off`){this._disableNativeGesturesIfNecessary();let t=()=>{this._touchstartTimeout&&clearTimeout(this._touchstartTimeout),this.hide(this._defaultOptions?.touchendHideDelay)};this._addListener(`touchend`,t),this._addListener(`touchcancel`,t)}}}_addListener(t,e){this._eventCleanups.push(this._renderer.listen(this._elementRef.nativeElement,t,e,Jt))}_isTouchPlatform(){let t=this._defaultOptions?.detectHoverCapability;return typeof t==`function`?!t():this._platform.IOS||this._platform.ANDROID?!0:this._platform.isBrowser?!!t&&this._mediaMatcher.matchMedia(`(any-hover: none)`).matches:!1}_disableNativeGesturesIfNecessary(){let t=this.touchGestures;if(t!==`off`){let e=this._elementRef.nativeElement,i=e.style;(t===`on`||e.nodeName!==`INPUT`&&e.nodeName!==`TEXTAREA`)&&(i.userSelect=i.msUserSelect=i.webkitUserSelect=i.MozUserSelect=`none`),(t===`on`||!e.draggable)&&(i.webkitUserDrag=`none`),i.touchAction=`none`,i.webkitTapHighlightColor=`transparent`}}_syncAriaDescription(t){this._ariaDescriptionPending||(this._ariaDescriptionPending=!0,this._ariaDescriber.removeDescription(this._elementRef.nativeElement,t,`tooltip`),this._isDestroyed||oD({write:()=>{this._ariaDescriptionPending=!1,this.message&&!this.disabled&&this._ariaDescriber.describe(this._elementRef.nativeElement,this.message,`tooltip`)}},{injector:this._injector}))}_overlayEventPredicate=t=>t.type===`keydown`?this._isTooltipVisible()&&t.keyCode===27&&!He(t):!0;static ɵfac=function(e){return new(e||n)};static ɵdir=vu({type:n,selectors:[[``,`matTooltip`,``]],hostAttrs:[1,`mat-mdc-tooltip-trigger`],hostVars:2,hostBindings:function(e,i){e&2&&Wh(`mat-mdc-tooltip-disabled`,i.disabled)},inputs:{position:[0,`matTooltipPosition`,`position`],positionAtOrigin:[0,`matTooltipPositionAtOrigin`,`positionAtOrigin`],disabled:[0,`matTooltipDisabled`,`disabled`],showDelay:[0,`matTooltipShowDelay`,`showDelay`],hideDelay:[0,`matTooltipHideDelay`,`hideDelay`],touchGestures:[0,`matTooltipTouchGestures`,`touchGestures`],message:[0,`matTooltip`,`message`],tooltipClass:[0,`matTooltipClass`,`tooltipClass`]},exportAs:[`matTooltip`]})}return n})();var oe=(()=>{class n{_changeDetectorRef=g(oC);_elementRef=g(Yn);_isMultiline=!1;message;tooltipClass;_showTimeoutId;_hideTimeoutId;_triggerElement;_mouseLeaveHideDelay;_animationsDisabled=j();_tooltip;_closeOnInteraction=!1;_isVisible=!1;_onHide=new Y;_showAnimation=`mat-mdc-tooltip-show`;_hideAnimation=`mat-mdc-tooltip-hide`;show(t){this._hideTimeoutId!=null&&clearTimeout(this._hideTimeoutId),this._showTimeoutId=setTimeout(()=>{this._toggleVisibility(!0),this._showTimeoutId=void 0},t)}hide(t){this._showTimeoutId!=null&&clearTimeout(this._showTimeoutId),this._hideTimeoutId=setTimeout(()=>{this._toggleVisibility(!1),this._hideTimeoutId=void 0},t)}afterHidden(){return this._onHide}isVisible(){return this._isVisible}ngOnDestroy(){this._cancelPendingAnimations(),this._onHide.complete(),this._triggerElement=null}_handleBodyInteraction(){this._closeOnInteraction&&this.hide(0)}_markForCheck(){this._changeDetectorRef.markForCheck()}_handleMouseLeave({relatedTarget:t}){(!t||!this._triggerElement.contains(t))&&(this.isVisible()?this.hide(this._mouseLeaveHideDelay):this._finalizeAnimation(!1))}_onShow(){this._isMultiline=this._isTooltipMultiline(),this._markForCheck()}_isTooltipMultiline(){let t=this._elementRef.nativeElement.getBoundingClientRect();return t.height>ie&&t.width>=ne}_handleAnimationEnd({animationName:t}){(t===this._showAnimation||t===this._hideAnimation)&&this._finalizeAnimation(t===this._showAnimation)}_cancelPendingAnimations(){this._showTimeoutId!=null&&clearTimeout(this._showTimeoutId),this._hideTimeoutId!=null&&clearTimeout(this._hideTimeoutId),this._showTimeoutId=this._hideTimeoutId=void 0}_finalizeAnimation(t){t?this._closeOnInteraction=!0:this.isVisible()||this._onHide.next()}_toggleVisibility(t){let e=this._tooltip.nativeElement,i=this._showAnimation,o=this._hideAnimation;if(e.classList.remove(t?o:i),e.classList.add(t?i:o),this._isVisible!==t&&(this._isVisible=t,this._changeDetectorRef.markForCheck()),t&&!this._animationsDisabled&&typeof getComputedStyle==`function`){let a=getComputedStyle(e);(a.getPropertyValue(`animation-duration`)===`0s`||a.getPropertyValue(`animation-name`)===`none`)&&(this._animationsDisabled=!0)}t&&this._onShow(),this._animationsDisabled&&(e.classList.add(`_mat-animation-noopable`),this._finalizeAnimation(t))}static ɵfac=function(e){return new(e||n)};static ɵcmp=cI({type:n,selectors:[[`mat-tooltip-component`]],viewQuery:function(e,i){if(e&1&&Vh(qt,7),e&2){let o;qI(o=ZI())&&(i._tooltip=o.first)}},hostAttrs:[`aria-hidden`,`true`],hostBindings:function(e,i){e&1&&Ph(`mouseleave`,function(a){return i._handleMouseLeave(a)})},decls:4,vars:5,consts:[[`tooltip`,``],[1,`mdc-tooltip`,`mat-mdc-tooltip`,3,`animationend`],[1,`mat-mdc-tooltip-surface`,`mdc-tooltip__surface`]],template:function(e,i){e&1&&(Tu(0,`div`,1,0),jh(`animationend`,function(a){return i._handleAnimationEnd(a)}),Tu(2,`div`,2),vw(3),_u()()),e&2&&(aw(i.tooltipClass),Wh(`mdc-tooltip--multiline`,i._isMultiline),ND(3),Xh(i.message))},styles:[`.mat-mdc-tooltip {
  position: relative;
  transform: scale(0);
  display: inline-flex;
}
.mat-mdc-tooltip::before {
  content: "";
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  position: absolute;
}
.mat-mdc-tooltip-panel-below .mat-mdc-tooltip::before {
  top: -8px;
}
.mat-mdc-tooltip-panel-above .mat-mdc-tooltip::before {
  bottom: -8px;
}
.mat-mdc-tooltip-panel-right .mat-mdc-tooltip::before {
  left: -8px;
}
.mat-mdc-tooltip-panel-left .mat-mdc-tooltip::before {
  right: -8px;
}
.mat-mdc-tooltip._mat-animation-noopable {
  animation: none;
  transform: scale(1);
}

.mat-mdc-tooltip-surface {
  word-break: normal;
  overflow-wrap: anywhere;
  padding: 4px 8px;
  min-width: 40px;
  max-width: 200px;
  min-height: 24px;
  max-height: 40vh;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  will-change: transform, opacity;
  background-color: var(--%NS%mat-tooltip-container-color, var(--%NS%mat-sys-inverse-surface));
  color: var(--%NS%mat-tooltip-supporting-text-color, var(--%NS%mat-sys-inverse-on-surface));
  border-radius: var(--%NS%mat-tooltip-container-shape, var(--%NS%mat-sys-corner-extra-small));
  font-family: var(--%NS%mat-tooltip-supporting-text-font, var(--%NS%mat-sys-body-small-font));
  font-size: var(--%NS%mat-tooltip-supporting-text-size, var(--%NS%mat-sys-body-small-size));
  font-weight: var(--%NS%mat-tooltip-supporting-text-weight, var(--%NS%mat-sys-body-small-weight));
  line-height: var(--%NS%mat-tooltip-supporting-text-line-height, var(--%NS%mat-sys-body-small-line-height));
  letter-spacing: var(--%NS%mat-tooltip-supporting-text-tracking, var(--%NS%mat-sys-body-small-tracking));
}
.mat-mdc-tooltip-surface::before {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border: 1px solid transparent;
  border-radius: inherit;
  content: "";
  pointer-events: none;
}
.mdc-tooltip--multiline .mat-mdc-tooltip-surface {
  text-align: left;
}
[dir=rtl] .mdc-tooltip--multiline .mat-mdc-tooltip-surface {
  text-align: right;
}

.mat-mdc-tooltip-panel {
  line-height: normal;
}
.mat-mdc-tooltip-panel.mat-mdc-tooltip-panel-non-interactive {
  pointer-events: none;
}

@keyframes mat-mdc-tooltip-show {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes mat-mdc-tooltip-hide {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}
.mat-mdc-tooltip-show {
  animation: mat-mdc-tooltip-show 150ms cubic-bezier(0, 0, 0.2, 1) forwards;
}

.mat-mdc-tooltip-hide {
  animation: mat-mdc-tooltip-hide 75ms cubic-bezier(0.4, 0, 1, 1) forwards;
}
`],encapsulation:2})}return n})();var Yt=(()=>{class n{static ɵfac=function(e){return new(e||n)};static ɵmod=ss({type:n});static ɵinj=Ir({imports:[Mn,me$1,Nt,vt]})}return n})();function ae(n,d){if(n&1&&(Wi(0,`mat-option`,17),vw(1),bu()),n&2){let t=d.$implicit;Ah(`value`,t),ND(),Su(` `,t,` `)}}function se(n,d){if(n&1){let t=BI();Wi(0,`mat-form-field`,14)(1,`mat-select`,16,0),Ph(`selectionChange`,function(i){md(t);return yd(UI(2)._changePageSize(i.value))}),OI(3,ae,2,2,`mat-option`,17,RI),bu(),Wi(5,`div`,18),Ph(`click`,function(){md(t);return yd(QI(2).open())}),bu()()}if(n&2){let t=UI(2);Ah(`appearance`,t._formFieldAppearance)(`color`,t.color),ND(),Ah(`value`,t.pageSize)(`disabled`,t.disabled),Nh(`aria-labelledby`,t._pageSizeLabelId),Ah(`panelClass`,t.selectConfig.panelClass||``)(`disableOptionCentering`,t.selectConfig.disableOptionCentering),ND(2),kI(t._displayedPageSizeOptions)}}function re(n,d){if(n&1&&(Wi(0,`div`,15),vw(1),bu()),n&2){let t=UI(2);ND(),Xh(t.pageSize)}}function le(n,d){if(n&1&&(Wi(0,`div`,3)(1,`div`,13),vw(2),bu(),xI(3,se,6,7,`mat-form-field`,14),xI(4,re,2,1,`div`,15),bu()),n&2){let t=UI();ND(),xh(`id`,t._pageSizeLabelId),ND(),Su(` `,t._intl.itemsPerPageLabel,` `),ND(),AI(t._displayedPageSizeOptions.length>1?3:-1),ND(),AI(t._displayedPageSizeOptions.length<=1?4:-1)}}function de(n,d){if(n&1){let t=BI();Wi(0,`button`,19),Ph(`click`,function(){md(t);let i=UI();return yd(i._buttonClicked(0,i._previousButtonsDisabled()))}),xd(),Wi(1,`svg`,8),Rh(2,`path`,20),bu()()}if(n&2){let t=UI();Ah(`matTooltip`,t._intl.firstPageLabel)(`matTooltipDisabled`,t._previousButtonsDisabled())(`disabled`,t._previousButtonsDisabled())(`tabindex`,t._previousButtonsDisabled()?-1:null),xh(`aria-label`,t._intl.firstPageLabel)}}function pe(n,d){if(n&1){let t=BI();Wi(0,`button`,21),Ph(`click`,function(){md(t);let i=UI();return yd(i._buttonClicked(i.getNumberOfPages()-1,i._nextButtonsDisabled()))}),xd(),Wi(1,`svg`,8),Rh(2,`path`,22),bu()()}if(n&2){let t=UI();Ah(`matTooltip`,t._intl.lastPageLabel)(`matTooltipDisabled`,t._nextButtonsDisabled())(`disabled`,t._nextButtonsDisabled())(`tabindex`,t._nextButtonsDisabled()?-1:null),xh(`aria-label`,t._intl.lastPageLabel)}}var ce=(()=>{class n{changes=new Y;itemsPerPageLabel=`Items per page:`;nextPageLabel=`Next page`;previousPageLabel=`Previous page`;firstPageLabel=`First page`;lastPageLabel=`Last page`;getRangeLabel=(t,e,i)=>{if(i==0||e==0)return`0 of ${i}`;i=Math.max(i,0);let o=t*e,a=o<i?Math.min(o+e,i):o+e;return`${o+1} \u2013 ${a} of ${i}`};static ɵfac=function(e){return new(e||n)};static ɵprov=Ae({token:n,factory:n.ɵfac})}return n})();var me=50;var he=new C(`MAT_PAGINATOR_DEFAULT_OPTIONS`);var Q=(()=>{class n{_intl=g(ce);_changeDetectorRef=g(oC);_formFieldAppearance;_pageSizeLabelId=g(Bt).getId(`mat-paginator-page-size-label-`);_intlChanges;_isInitialized=!1;_initializedStream=new ur(1);color;get pageIndex(){return this._pageIndex}set pageIndex(t){this._pageIndex=Math.max(t||0,0),this._changeDetectorRef.markForCheck()}_pageIndex=0;get length(){return this._length}set length(t){this._length=t||0,this._changeDetectorRef.markForCheck()}_length=0;get pageSize(){return this._pageSize}set pageSize(t){this._pageSize=Math.max(t||0,0),this._updateDisplayedPageSizeOptions()}_pageSize;get pageSizeOptions(){return this._pageSizeOptions}set pageSizeOptions(t){this._pageSizeOptions=(t||[]).map(e=>g1(e,0)),this._updateDisplayedPageSizeOptions()}_pageSizeOptions=[];hidePageSize=!1;showFirstLastButtons=!1;selectConfig={};disabled=!1;page=new qe;_displayedPageSizeOptions;initialized=this._initializedStream;constructor(){let t=this._intl,e=g(he,{optional:!0});if(this._intlChanges=t.changes.subscribe(()=>this._changeDetectorRef.markForCheck()),e){let{pageSize:i,pageSizeOptions:o,hidePageSize:a,showFirstLastButtons:x}=e;i!=null&&(this._pageSize=i),o!=null&&(this._pageSizeOptions=o),a!=null&&(this.hidePageSize=a),x!=null&&(this.showFirstLastButtons=x)}this._formFieldAppearance=e?.formFieldAppearance||`outline`}ngOnInit(){this._isInitialized=!0,this._updateDisplayedPageSizeOptions(),this._initializedStream.next()}ngOnDestroy(){this._initializedStream.complete(),this._intlChanges.unsubscribe()}nextPage(){this.hasNextPage()&&this._navigate(this.pageIndex+1)}previousPage(){this.hasPreviousPage()&&this._navigate(this.pageIndex-1)}firstPage(){this.hasPreviousPage()&&this._navigate(0)}lastPage(){this.hasNextPage()&&this._navigate(this.getNumberOfPages()-1)}hasPreviousPage(){return this.pageIndex>=1&&this.pageSize!=0}hasNextPage(){let t=this.getNumberOfPages()-1;return this.pageIndex<t&&this.pageSize!=0}getNumberOfPages(){return this.pageSize?Math.ceil(this.length/this.pageSize):0}_changePageSize(t){let e=this.pageIndex*this.pageSize,i=this.pageIndex;this.pageIndex=Math.floor(e/t)||0,this.pageSize=t,this._emitPageEvent(i)}_nextButtonsDisabled(){return this.disabled||!this.hasNextPage()}_previousButtonsDisabled(){return this.disabled||!this.hasPreviousPage()}_updateDisplayedPageSizeOptions(){this._isInitialized&&(this.pageSize||(this._pageSize=this.pageSizeOptions.length!=0?this.pageSizeOptions[0]:me),this._displayedPageSizeOptions=this.pageSizeOptions.slice(),this._displayedPageSizeOptions.indexOf(this.pageSize)===-1&&this._displayedPageSizeOptions.push(this.pageSize),this._displayedPageSizeOptions.sort((t,e)=>t-e),this._changeDetectorRef.markForCheck())}_emitPageEvent(t){this.page.emit({previousPageIndex:t,pageIndex:this.pageIndex,pageSize:this.pageSize,length:this.length})}_navigate(t){let e=this.pageIndex;t!==e&&(this.pageIndex=t,this._emitPageEvent(e))}_buttonClicked(t,e){e||this._navigate(t)}static ɵfac=function(e){return new(e||n)};static ɵcmp=cI({type:n,selectors:[[`mat-paginator`]],hostAttrs:[`role`,`group`,1,`mat-mdc-paginator`],inputs:{color:`color`,pageIndex:[2,`pageIndex`,`pageIndex`,g1],length:[2,`length`,`length`,g1],pageSize:[2,`pageSize`,`pageSize`,g1],pageSizeOptions:`pageSizeOptions`,hidePageSize:[2,`hidePageSize`,`hidePageSize`,h1],showFirstLastButtons:[2,`showFirstLastButtons`,`showFirstLastButtons`,h1],selectConfig:`selectConfig`,disabled:[2,`disabled`,`disabled`,h1]},outputs:{page:`page`},exportAs:[`matPaginator`],decls:14,vars:14,consts:[[`selectRef`,``],[1,`mat-mdc-paginator-outer-container`],[1,`mat-mdc-paginator-container`],[1,`mat-mdc-paginator-page-size`],[1,`mat-mdc-paginator-range-actions`],[`aria-atomic`,`true`,`aria-live`,`polite`,`role`,`status`,1,`mat-mdc-paginator-range-label`],[`matIconButton`,``,`type`,`button`,`matTooltipPosition`,`above`,`disabledInteractive`,``,1,`mat-mdc-paginator-navigation-first`,3,`matTooltip`,`matTooltipDisabled`,`disabled`,`tabindex`],[`matIconButton`,``,`type`,`button`,`matTooltipPosition`,`above`,`disabledInteractive`,``,1,`mat-mdc-paginator-navigation-previous`,3,`click`,`matTooltip`,`matTooltipDisabled`,`disabled`,`tabindex`],[`viewBox`,`0 0 24 24`,`focusable`,`false`,`aria-hidden`,`true`,1,`mat-mdc-paginator-icon`],[`d`,`M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z`],[`matIconButton`,``,`type`,`button`,`matTooltipPosition`,`above`,`disabledInteractive`,``,1,`mat-mdc-paginator-navigation-next`,3,`click`,`matTooltip`,`matTooltipDisabled`,`disabled`,`tabindex`],[`d`,`M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z`],[`matIconButton`,``,`type`,`button`,`matTooltipPosition`,`above`,`disabledInteractive`,``,1,`mat-mdc-paginator-navigation-last`,3,`matTooltip`,`matTooltipDisabled`,`disabled`,`tabindex`],[`aria-hidden`,`true`,1,`mat-mdc-paginator-page-size-label`],[1,`mat-mdc-paginator-page-size-select`,3,`appearance`,`color`],[1,`mat-mdc-paginator-page-size-value`],[`hideSingleSelectionIndicator`,``,3,`selectionChange`,`value`,`disabled`,`aria-labelledby`,`panelClass`,`disableOptionCentering`],[3,`value`],[1,`mat-mdc-paginator-touch-target`,3,`click`],[`matIconButton`,``,`type`,`button`,`matTooltipPosition`,`above`,`disabledInteractive`,``,1,`mat-mdc-paginator-navigation-first`,3,`click`,`matTooltip`,`matTooltipDisabled`,`disabled`,`tabindex`],[`d`,`M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z`],[`matIconButton`,``,`type`,`button`,`matTooltipPosition`,`above`,`disabledInteractive`,``,1,`mat-mdc-paginator-navigation-last`,3,`click`,`matTooltip`,`matTooltipDisabled`,`disabled`,`tabindex`],[`d`,`M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z`]],template:function(e,i){e&1&&(Wi(0,`div`,1)(1,`div`,2),xI(2,le,5,4,`div`,3),Wi(3,`div`,4)(4,`div`,5),vw(5),bu(),xI(6,de,3,5,`button`,6),Wi(7,`button`,7),Ph(`click`,function(){return i._buttonClicked(i.pageIndex-1,i._previousButtonsDisabled())}),xd(),Wi(8,`svg`,8),Rh(9,`path`,9),bu()(),Ad(),Wi(10,`button`,10),Ph(`click`,function(){return i._buttonClicked(i.pageIndex+1,i._nextButtonsDisabled())}),xd(),Wi(11,`svg`,8),Rh(12,`path`,11),bu()(),xI(13,pe,3,5,`button`,12),bu()()()),e&2&&(ND(2),AI(i.hidePageSize?-1:2),ND(3),Su(` `,i._intl.getRangeLabel(i.pageIndex,i.pageSize,i.length),` `),ND(),AI(i.showFirstLastButtons?6:-1),ND(),Ah(`matTooltip`,i._intl.previousPageLabel)(`matTooltipDisabled`,i._previousButtonsDisabled())(`disabled`,i._previousButtonsDisabled())(`tabindex`,i._previousButtonsDisabled()?-1:null),xh(`aria-label`,i._intl.previousPageLabel),ND(3),Ah(`matTooltip`,i._intl.nextPageLabel)(`matTooltipDisabled`,i._nextButtonsDisabled())(`disabled`,i._nextButtonsDisabled())(`tabindex`,i._nextButtonsDisabled()?-1:null),xh(`aria-label`,i._intl.nextPageLabel),ND(3),AI(i.showFirstLastButtons?13:-1))},dependencies:[Pn,Bt$1,jn,Vn,jt],styles:[`.mat-mdc-paginator {
  display: block;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  color: var(--%NS%mat-paginator-container-text-color, var(--%NS%mat-sys-on-surface));
  background-color: var(--%NS%mat-paginator-container-background-color, var(--%NS%mat-sys-surface));
  font-family: var(--%NS%mat-paginator-container-text-font, var(--%NS%mat-sys-body-small-font));
  line-height: var(--%NS%mat-paginator-container-text-line-height, var(--%NS%mat-sys-body-small-line-height));
  font-size: var(--%NS%mat-paginator-container-text-size, var(--%NS%mat-sys-body-small-size));
  font-weight: var(--%NS%mat-paginator-container-text-weight, var(--%NS%mat-sys-body-small-weight));
  letter-spacing: var(--%NS%mat-paginator-container-text-tracking, var(--%NS%mat-sys-body-small-tracking));
  --%NS%mat-form-field-container-height: var(--%NS%mat-paginator-form-field-container-height, 40px);
  --%NS%mat-form-field-container-vertical-padding: var(--%NS%mat-paginator-form-field-container-vertical-padding, 8px);
}
.mat-mdc-paginator .mat-mdc-select-value {
  font-size: var(--%NS%mat-paginator-select-trigger-text-size, var(--%NS%mat-sys-body-small-size));
}
.mat-mdc-paginator .mat-mdc-form-field-subscript-wrapper {
  display: none;
}
.mat-mdc-paginator .mat-mdc-select {
  line-height: 1.5;
}

.mat-mdc-paginator-outer-container {
  display: flex;
}

.mat-mdc-paginator-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 8px;
  flex-wrap: wrap;
  width: 100%;
  min-height: var(--%NS%mat-paginator-container-size, 56px);
}

.mat-mdc-paginator-page-size {
  display: flex;
  align-items: baseline;
  margin-right: 8px;
}
[dir=rtl] .mat-mdc-paginator-page-size {
  margin-right: 0;
  margin-left: 8px;
}

.mat-mdc-paginator-page-size-label {
  margin: 0 4px;
}

.mat-mdc-paginator-page-size-select {
  margin: 0 4px;
  width: var(--%NS%mat-paginator-page-size-select-width, 84px);
}

.mat-mdc-paginator-range-label {
  margin: 0 32px 0 24px;
}

.mat-mdc-paginator-range-actions {
  display: flex;
  align-items: center;
}

.mat-mdc-paginator-icon {
  display: inline-block;
  width: 28px;
  fill: var(--%NS%mat-paginator-enabled-icon-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-icon-button[aria-disabled] .mat-mdc-paginator-icon {
  fill: var(--%NS%mat-paginator-disabled-icon-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
[dir=rtl] .mat-mdc-paginator-icon {
  transform: rotate(180deg);
}

@media (forced-colors: active) {
  .mat-mdc-icon-button[aria-disabled] .mat-mdc-paginator-icon,
  .mat-mdc-paginator-icon {
    fill: currentColor;
  }
  .mat-mdc-paginator-range-actions .mat-mdc-icon-button {
    outline: solid 1px;
  }
  .mat-mdc-paginator-range-actions .mat-mdc-icon-button[aria-disabled] {
    color: GrayText;
  }
}
.mat-mdc-paginator-touch-target {
  display: var(--%NS%mat-paginator-touch-target-display, block);
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--%NS%mat-paginator-page-size-select-width, 84px);
  height: var(--%NS%mat-paginator-page-size-select-touch-target-height, 48px);
  background-color: transparent;
  transform: translate(-50%, -50%);
  cursor: pointer;
}
`],encapsulation:2})}return n})();var Xt=(()=>{class n{static ɵfac=function(e){return new(e||n)};static ɵmod=ss({type:n});static ɵinj=Ir({imports:[rr,Kt$1,Yt,Q]})}return n})();var Ut=(n,d)=>d.key;var ge=(n,d)=>d.id;function ue(n,d){n&1&&Rh(0,`mat-progress-bar`,0)}function fe(n,d){if(n&1&&(Wi(0,`th`),vw(1),bu()),n&2){let t=d.$implicit;ND(),Xh(t.label)}}function be(n,d){n&1&&(Wi(0,`th`),vw(1,`Acciones`),bu())}function ve(n,d){if(n&1&&(Wi(0,`td`),vw(1),bu()),n&2){let t=d.$implicit,e=UI().$implicit;ND(),Xh(e[t.key]??`—`)}}function ye(n,d){if(n&1){let t=BI();Wi(0,`td`)(1,`button`,4),Ph(`click`,function(){md(t);let i=UI().$implicit;return yd(UI().selected.emit(i))}),vw(2),bu()()}if(n&2){let t=UI(2);ND(2),Xh(t.actionLabel())}}function Te(n,d){if(n&1&&(Wi(0,`tr`),OI(1,ve,2,1,`td`,null,Ut),xI(3,ye,3,1,`td`),bu()),n&2){let t=UI();ND(),kI(t.columns()),ND(2),AI(t.actionLabel()?3:-1)}}function Se(n,d){if(n&1&&(Wi(0,`div`,2)(1,`mat-icon`),vw(2,`inbox`),bu(),Wi(3,`h3`),vw(4),bu(),Wi(5,`p`),vw(6,`Los registros aparecerán aquí cuando los agregues.`),bu()()),n&2){let t=UI();ND(4),Xh(t.emptyText())}}var $t=class n{rows=l1.required();columns=l1.required();loading=l1(!1);total=l1(0);page=l1(1);actionLabel=l1(`Ver detalle`);emptyText=l1(`Todavía no hay registros`);selected=u1();pageChange=u1();changePage(d){this.pageChange.emit(d.pageIndex+1)}static ɵfac=function(t){return new(t||n)};static ɵcmp=cI({type:n,selectors:[[`app-table`]],inputs:{rows:[1,`rows`],columns:[1,`columns`],loading:[1,`loading`],total:[1,`total`],page:[1,`page`],actionLabel:[1,`actionLabel`],emptyText:[1,`emptyText`]},outputs:{selected:`selected`,pageChange:`pageChange`},decls:13,vars:7,consts:[[`mode`,`indeterminate`],[1,`table-scroll`],[1,`empty`],[`aria-label`,`Paginación`,3,`page`,`length`,`pageIndex`,`pageSize`,`hidePageSize`],[`mat-button`,``,3,`click`]],template:function(t,e){t&1&&(xI(0,ue,1,0,`mat-progress-bar`,0),Wi(1,`div`,1)(2,`table`)(3,`thead`)(4,`tr`),OI(5,fe,2,1,`th`,null,Ut),xI(7,be,2,0,`th`),bu()(),Wi(8,`tbody`),OI(9,Te,4,1,`tr`,null,ge),bu()()(),xI(11,Se,7,1,`div`,2),Wi(12,`mat-paginator`,3),Ph(`page`,function(o){return e.changePage(o)}),bu()),t&2&&(AI(e.loading()?0:-1),ND(5),kI(e.columns()),ND(2),AI(e.actionLabel()?7:-1),ND(2),kI(e.rows()),ND(2),AI(!e.loading()&&e.rows().length===0?11:-1),ND(),Ah(`length`,e.total())(`pageIndex`,e.page()-1)(`pageSize`,20)(`hidePageSize`,!0))},dependencies:[Xt,Q,Z,L,rr,ir,yt,wt$1],encapsulation:2})};export{$t as t};