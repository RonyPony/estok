import{$ as Om,$n as vw,At as X,Bt as _h,C as Fh,Ct as UI,D as GI,Et as Vh,Fn as oD,Gt as bm,Ht as _u,It as Yn,Jt as cI,Kt as bu,Ln as qI,Lt as ZI,M as Hs,Mn as ne,Mt as Xn,Ot as Wh,P as Ir,Pn as oC,Pt as Y,Qn as vu,Rn as qe,St as U$1,U as Lt,Un as ss,Ut as aw,X as OI,_t as Su,an as fe,ar as xd,bn as ki,ct as Rh,d as Bh,dr as yp,fn as h1,fr as z,ir as xI,jt as Xh,k as Gn,kn as md,kt as Wi,lt as Ri,m as Ch,nt as P,o as Ah,or as xh,ot as QI,p as C,pr as zI,q as ND,r as AI,rt as Ph,sn as g,tr as wn,u as BI,un as gi,ur as yd,ut as Rm,vn as jh,vt as Sw,w as Fs,xt as Tu,yn as kI,zt as _E}from"./chunk-ez20LXaH.js";import{B as rr,C as an,M as ir,N as j,O as en,S as Z,b as Vn,c as He,f as Nt$1,i as Ct$1,l as Ii,m as Pt$1,o as G,r as Bt,s as Gn$1,t as A}from"./chunk-CPnaw6rc.js";import{C as u,E as bo,O as ur,T as Tt$1,c as Ot$1,d as Y$1,g as me,k as i,n as Dt,r as Et$1,u as X$1,x as vt}from"./main-5LPOYN3L.js";import{t as a}from"./chunk-BeKXe6Tj.js";import{n as yt$1,t as wt$1}from"./chunk-BZrr8D4z.js";var yt=[[[`mat-icon`],[``,`matMenuItemIcon`,``]],`*`];var xt=[`mat-icon, [matMenuItemIcon]`,`*`];function Ct(i,d){i&1&&(xd(),Wi(0,`svg`,2),Rh(1,`polygon`,3),bu())}var Pt=[`*`];function St(i,d){if(i&1){let e=BI();Tu(0,`div`,0),jh(`click`,function(){md(e);return yd(UI().closed.emit(`click`))})(`animationstart`,function(n){md(e);return yd(UI()._onAnimationStart(n.animationName))})(`animationend`,function(n){md(e);return yd(UI()._onAnimationDone(n.animationName))})(`animationcancel`,function(n){md(e);return yd(UI()._onAnimationDone(n.animationName))}),Tu(1,`div`,1),zI(2),_u()()}if(i&2){let e=UI();aw(e._classList),Wh(`mat-menu-panel-animations-disabled`,e._animationsDisabled)(`mat-menu-panel-exit-animation`,e._panelAnimationState===`void`)(`mat-menu-panel-animating`,e._isAnimating()),Fh(`id`,e.panelId),xh(`aria-label`,e.ariaLabel||null)(`aria-labelledby`,e.ariaLabelledby||null)(`aria-describedby`,e.ariaDescribedby||null)}}var oe=new C(`MAT_MENU_PANEL`);var N=(()=>{class i{_elementRef=g(Yn);_document=g(U$1);_focusMonitor=g(Ct$1);_parentMenu=g(oe,{optional:!0});_changeDetectorRef=g(oC);role=`menuitem`;disabled=!1;disableRipple=!1;_hovered=new Y;_focused=new Y;_highlighted=!1;_triggersSubmenu=!1;constructor(){g(A).load(en),this._parentMenu?.addItem?.(this)}focus(e,t){this._focusMonitor&&e?this._focusMonitor.focusVia(this._getHostElement(),e,t):this._getHostElement().focus(t),this._focused.next(this)}ngAfterViewInit(){this._focusMonitor&&this._focusMonitor.monitor(this._elementRef,!1)}ngOnDestroy(){this._focusMonitor&&this._focusMonitor.stopMonitoring(this._elementRef),this._parentMenu&&this._parentMenu.removeItem&&this._parentMenu.removeItem(this),this._hovered.complete(),this._focused.complete()}_getTabIndex(){return this.disabled?`-1`:`0`}_getHostElement(){return this._elementRef.nativeElement}_checkDisabled(e){this.disabled&&(e.preventDefault(),e.stopPropagation())}_handleMouseEnter(){this._hovered.next(this)}getLabel(){let e=this._elementRef.nativeElement.cloneNode(!0),t=e.querySelectorAll(`mat-icon, .material-icons`);for(let n=0;n<t.length;n++)t[n].remove();return e.textContent?.trim()||``}_setHighlighted(e){this._highlighted=e,this._changeDetectorRef.markForCheck()}_setTriggersSubmenu(e){this._triggersSubmenu=e,this._changeDetectorRef.markForCheck()}_hasFocus(){return this._document&&this._document.activeElement===this._getHostElement()}static ɵfac=function(t){return new(t||i)};static ɵcmp=cI({type:i,selectors:[[``,`mat-menu-item`,``]],hostAttrs:[1,`mat-mdc-menu-item`,`mat-focus-indicator`],hostVars:8,hostBindings:function(t,n){t&1&&Ph(`click`,function(o){return n._checkDisabled(o)})(`mouseenter`,function(){return n._handleMouseEnter()}),t&2&&(xh(`role`,n.role)(`tabindex`,n._getTabIndex())(`aria-disabled`,n.disabled)(`disabled`,n.disabled||null),Wh(`mat-mdc-menu-item-highlighted`,n._highlighted)(`mat-mdc-menu-item-submenu-trigger`,n._triggersSubmenu))},inputs:{role:`role`,disabled:[2,`disabled`,`disabled`,h1],disableRipple:[2,`disableRipple`,`disableRipple`,h1]},exportAs:[`matMenuItem`],ngContentSelectors:xt,decls:5,vars:3,consts:[[1,`mat-mdc-menu-item-text`],[`matRipple`,``,1,`mat-mdc-menu-ripple`,3,`matRippleDisabled`,`matRippleTrigger`],[`viewBox`,`0 0 5 10`,`focusable`,`false`,`aria-hidden`,`true`,1,`mat-mdc-menu-submenu-icon`],[`points`,`0,0 5,5 0,10`]],template:function(t,n){t&1&&(GI(yt),zI(0),Wi(1,`span`,0),zI(2,1),bu(),Rh(3,`div`,1),xI(4,Ct,2,0,`:svg:svg`,2)),t&2&&(ND(3),Ah(`matRippleDisabled`,n.disableRipple||n.disabled)(`matRippleTrigger`,n._getHostElement()),ND(),AI(n._triggersSubmenu?4:-1))},dependencies:[Ii],encapsulation:2})}return i})();var wt=new C(`MatMenuContent`);var kt=new C(`mat-menu-default-options`,{providedIn:`root`,factory:()=>({overlapTrigger:!1,xPosition:`after`,yPosition:`below`,backdropClass:`cdk-overlay-transparent-backdrop`})});var ae=`_mat-menu-enter`;var U=`_mat-menu-exit`;var x=(()=>{class i{_elementRef=g(Yn);_changeDetectorRef=g(oC);_injector=g(fe);_keyManager;_xPosition;_yPosition;_firstItemFocusRef;_exitFallbackTimeout;_animationsDisabled=j();_allItems;_directDescendantItems=new Ri;_classList={};_panelAnimationState=`void`;_animationDone=new Y;_isAnimating=gi(!1);parentMenu;direction;overlayPanelClass;backdropClass;ariaLabel;ariaLabelledby;ariaDescribedby;get xPosition(){return this._xPosition}set xPosition(e){this._xPosition=e,this.setPositionClasses()}get yPosition(){return this._yPosition}set yPosition(e){this._yPosition=e,this.setPositionClasses()}templateRef;items;lazyContent;overlapTrigger=!1;hasBackdrop;get panelClass(){return this._previousPanelClass}set panelClass(e){let t=this._previousPanelClass,n=P({},this._classList);t&&t.length&&t.split(` `).forEach(a=>{n[a]=!1}),this._previousPanelClass=e,e&&e.length&&(e.split(` `).forEach(a=>{n[a]=!0}),this._elementRef.nativeElement.className=``),this._classList=n}_previousPanelClass=``;get classList(){return this.panelClass}set classList(e){this.panelClass=e}closed=new qe;close=this.closed;panelId=g(Bt).getId(`mat-menu-panel-`);constructor(){let e=g(kt);this.overlayPanelClass=e.overlayPanelClass||``,this._xPosition=e.xPosition,this._yPosition=e.yPosition,this.backdropClass=e.backdropClass,this.overlapTrigger=e.overlapTrigger,this.hasBackdrop=e.hasBackdrop}ngOnInit(){this.setPositionClasses()}ngAfterContentInit(){this._updateDirectDescendants(),this._keyManager=new Pt$1(this._directDescendantItems).withWrap().withTypeAhead().withHomeAndEnd(),this._keyManager.tabOut.subscribe(()=>this.closed.emit(`tab`)),this._directDescendantItems.changes.pipe(Rm(this._directDescendantItems),Hs(e=>bm(...e.map(t=>t._focused)))).subscribe(e=>this._keyManager.updateActiveItem(e)),this._directDescendantItems.changes.subscribe(e=>{let t=this._keyManager;if(this._panelAnimationState===`enter`&&t.activeItem?._hasFocus()){let n=e.toArray(),a=Math.max(0,Math.min(n.length-1,t.activeItemIndex||0));n[a]&&!n[a].disabled?t.setActiveItem(a):t.setNextItemActive()}})}ngOnDestroy(){this._keyManager?.destroy(),this._directDescendantItems.destroy(),this.closed.complete(),this._firstItemFocusRef?.destroy(),clearTimeout(this._exitFallbackTimeout)}_hovered(){return this._directDescendantItems.changes.pipe(Rm(this._directDescendantItems),Hs(t=>bm(...t.map(n=>n._hovered))))}addItem(e){}removeItem(e){}_handleKeydown(e){let t=e.keyCode,n=this._keyManager;switch(t){case 27:He(e)||(e.preventDefault(),this.closed.emit(`keydown`));break;case 37:this.parentMenu&&this.direction===`ltr`&&this.closed.emit(`keydown`);break;case 39:this.parentMenu&&this.direction===`rtl`&&this.closed.emit(`keydown`);break;default:(t===38||t===40)&&n.setFocusOrigin(`keyboard`),n.onKeydown(e);return}}focusFirstItem(e=`program`){this._firstItemFocusRef?.destroy(),this._firstItemFocusRef=oD(()=>{let t=this._resolvePanel();if(!t||!t.contains(document.activeElement)){let n=this._keyManager;n.setFocusOrigin(e).setFirstItemActive(),!n.activeItem&&t&&t.focus()}},{injector:this._injector})}resetActiveItem(){this._keyManager.setActiveItem(-1)}setElevation(e){}setPositionClasses(e=this.xPosition,t=this.yPosition){this._classList=z(P({},this._classList),{"mat-menu-before":e===`before`,"mat-menu-after":e===`after`,"mat-menu-above":t===`above`,"mat-menu-below":t===`below`}),this._changeDetectorRef.markForCheck()}_onAnimationDone(e){let t=e===U;(t||e===ae)&&(t&&(clearTimeout(this._exitFallbackTimeout),this._exitFallbackTimeout=void 0),this._animationDone.next(t?`void`:`enter`),this._isAnimating.set(!1))}_onAnimationStart(e){(e===ae||e===U)&&this._isAnimating.set(!0)}_setIsOpen(e){if(this._panelAnimationState=e?`enter`:`void`,e){if(this._keyManager.activeItemIndex===0){let t=this._resolvePanel();t&&(t.scrollTop=0)}}else this._animationsDisabled||(this._exitFallbackTimeout=setTimeout(()=>this._onAnimationDone(U),200));this._animationsDisabled&&setTimeout(()=>{this._onAnimationDone(e?ae:U)}),this._changeDetectorRef.markForCheck()}_updateDirectDescendants(){this._allItems.changes.pipe(Rm(this._allItems)).subscribe(e=>{this._directDescendantItems.reset(e.filter(t=>t._parentMenu===this)),this._directDescendantItems.notifyOnChanges()})}_resolvePanel(){let e=null;return this._directDescendantItems.length&&(e=this._directDescendantItems.first._getHostElement().closest(`[role="menu"]`)),e}static ɵfac=function(t){return new(t||i)};static ɵcmp=cI({type:i,selectors:[[`mat-menu`]],contentQueries:function(t,n,a){if(t&1&&Bh(a,wt,5)(a,N,5)(a,N,4),t&2){let o;qI(o=ZI())&&(n.lazyContent=o.first),qI(o=ZI())&&(n._allItems=o),qI(o=ZI())&&(n.items=o)}},viewQuery:function(t,n){if(t&1&&Vh(Gn,5),t&2){let a;qI(a=ZI())&&(n.templateRef=a.first)}},hostVars:3,hostBindings:function(t,n){t&2&&xh(`aria-label`,null)(`aria-labelledby`,null)(`aria-describedby`,null)},inputs:{backdropClass:`backdropClass`,ariaLabel:[0,`aria-label`,`ariaLabel`],ariaLabelledby:[0,`aria-labelledby`,`ariaLabelledby`],ariaDescribedby:[0,`aria-describedby`,`ariaDescribedby`],xPosition:`xPosition`,yPosition:`yPosition`,overlapTrigger:[2,`overlapTrigger`,`overlapTrigger`,h1],hasBackdrop:[2,`hasBackdrop`,`hasBackdrop`,e=>e==null?null:h1(e)],panelClass:[0,`class`,`panelClass`],classList:`classList`},outputs:{closed:`closed`,close:`close`},exportAs:[`matMenu`],features:[Sw([{provide:oe,useExisting:i}])],ngContentSelectors:Pt,decls:1,vars:0,consts:[[`tabindex`,`-1`,`role`,`menu`,1,`mat-mdc-menu-panel`,3,`click`,`animationstart`,`animationend`,`animationcancel`,`id`],[1,`mat-mdc-menu-content`]],template:function(t,n){t&1&&(GI(),_h(0,St,3,12,`ng-template`))},styles:[`mat-menu {
  display: none;
}

.mat-mdc-menu-content {
  margin: 0;
  padding: 8px 0;
  outline: 0;
}
.mat-mdc-menu-content,
.mat-mdc-menu-content .mat-mdc-menu-item .mat-mdc-menu-item-text {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  flex: 1;
  white-space: normal;
  font-family: var(--%NS%mat-menu-item-label-text-font, var(--%NS%mat-sys-label-large-font));
  line-height: var(--%NS%mat-menu-item-label-text-line-height, var(--%NS%mat-sys-label-large-line-height));
  font-size: var(--%NS%mat-menu-item-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-menu-item-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  font-weight: var(--%NS%mat-menu-item-label-text-weight, var(--%NS%mat-sys-label-large-weight));
}

@keyframes _mat-menu-enter {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes _mat-menu-exit {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.mat-mdc-menu-panel {
  min-width: 112px;
  max-width: 280px;
  overflow: auto;
  box-sizing: border-box;
  outline: 0;
  animation: _mat-menu-enter 120ms cubic-bezier(0, 0, 0.2, 1);
  border-radius: var(--%NS%mat-menu-container-shape, var(--%NS%mat-sys-corner-extra-small));
  background-color: var(--%NS%mat-menu-container-color, var(--%NS%mat-sys-surface-container));
  box-shadow: var(--%NS%mat-menu-container-elevation-shadow, 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12));
  will-change: transform, opacity;
}
.mat-mdc-menu-panel.mat-menu-panel-exit-animation {
  animation: _mat-menu-exit 100ms 25ms linear forwards;
}
.mat-mdc-menu-panel.mat-menu-panel-animations-disabled {
  animation: none;
}
.mat-mdc-menu-panel.mat-menu-panel-animating {
  pointer-events: none;
}
.mat-mdc-menu-panel.mat-menu-panel-animating:has(.mat-mdc-menu-content:empty) {
  display: none;
}
@media (forced-colors: active) {
  .mat-mdc-menu-panel {
    outline: solid 1px;
  }
}
.mat-mdc-menu-panel .mat-divider {
  border-top-color: var(--%NS%mat-menu-divider-color, var(--%NS%mat-sys-surface-variant));
  margin-bottom: var(--%NS%mat-menu-divider-bottom-spacing, 8px);
  margin-top: var(--%NS%mat-menu-divider-top-spacing, 8px);
}

.mat-mdc-menu-item {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
  color: inherit;
  font-size: inherit;
  background: none;
  text-decoration: none;
  margin: 0;
  min-height: 48px;
  padding-left: var(--%NS%mat-menu-item-leading-spacing, 12px);
  padding-right: var(--%NS%mat-menu-item-trailing-spacing, 12px);
  -webkit-user-select: none;
  user-select: none;
  cursor: pointer;
  outline: none;
  border: none;
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-menu-item::-moz-focus-inner {
  border: 0;
}
[dir=rtl] .mat-mdc-menu-item {
  padding-left: var(--%NS%mat-menu-item-trailing-spacing, 12px);
  padding-right: var(--%NS%mat-menu-item-leading-spacing, 12px);
}
.mat-mdc-menu-item:has(.material-icons, mat-icon, [matButtonIcon]) {
  padding-left: var(--%NS%mat-menu-item-with-icon-leading-spacing, 12px);
  padding-right: var(--%NS%mat-menu-item-with-icon-trailing-spacing, 12px);
}
[dir=rtl] .mat-mdc-menu-item:has(.material-icons, mat-icon, [matButtonIcon]) {
  padding-left: var(--%NS%mat-menu-item-with-icon-trailing-spacing, 12px);
  padding-right: var(--%NS%mat-menu-item-with-icon-leading-spacing, 12px);
}
.mat-mdc-menu-item, .mat-mdc-menu-item:visited, .mat-mdc-menu-item:link {
  color: var(--%NS%mat-menu-item-label-text-color, var(--%NS%mat-sys-on-surface));
}
.mat-mdc-menu-item .mat-icon-no-color,
.mat-mdc-menu-item .mat-mdc-menu-submenu-icon {
  color: var(--%NS%mat-menu-item-icon-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-menu-item[disabled] {
  cursor: default;
  opacity: 0.38;
}
.mat-mdc-menu-item[disabled]::after {
  display: block;
  position: absolute;
  content: "";
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.mat-mdc-menu-item:focus {
  outline: 0;
}
.mat-mdc-menu-item .mat-icon {
  flex-shrink: 0;
  margin-right: var(--%NS%mat-menu-item-spacing, 12px);
  height: var(--%NS%mat-menu-item-icon-size, 24px);
  width: var(--%NS%mat-menu-item-icon-size, 24px);
}
[dir=rtl] .mat-mdc-menu-item {
  text-align: right;
}
[dir=rtl] .mat-mdc-menu-item .mat-icon {
  margin-right: 0;
  margin-left: var(--%NS%mat-menu-item-spacing, 12px);
}
.mat-mdc-menu-item:not([disabled]):hover {
  background-color: var(--%NS%mat-menu-item-hover-state-layer-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) calc(var(--%NS%mat-sys-hover-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-menu-item:not([disabled]).cdk-program-focused, .mat-mdc-menu-item:not([disabled]).cdk-keyboard-focused, .mat-mdc-menu-item:not([disabled]).mat-mdc-menu-item-highlighted {
  background-color: var(--%NS%mat-menu-item-focus-state-layer-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) calc(var(--%NS%mat-sys-focus-state-layer-opacity) * 100%), transparent));
}
@media (forced-colors: active) {
  .mat-mdc-menu-item {
    margin-top: 1px;
  }
}

.mat-mdc-menu-submenu-icon {
  width: var(--%NS%mat-menu-item-icon-size, 24px);
  height: 10px;
  fill: currentColor;
  padding-left: var(--%NS%mat-menu-item-spacing, 12px);
}
[dir=rtl] .mat-mdc-menu-submenu-icon {
  padding-right: var(--%NS%mat-menu-item-spacing, 12px);
  padding-left: 0;
}
[dir=rtl] .mat-mdc-menu-submenu-icon polygon {
  transform: scaleX(-1);
  transform-origin: center;
}
@media (forced-colors: active) {
  .mat-mdc-menu-submenu-icon {
    fill: CanvasText;
  }
}

.mat-mdc-menu-item .mat-mdc-menu-ripple {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
}
`],encapsulation:2})}return i})();var Ot=new C(`mat-menu-scroll-strategy`,{providedIn:`root`,factory:()=>{let i=g(fe);return()=>Ot$1(i)}});var y=new WeakMap;var It=(()=>{class i{_canHaveBackdrop;_element=g(Yn);_viewContainerRef=g(Xn);_menuItemInstance=g(N,{optional:!0,self:!0});_dir=g(Gn$1,{optional:!0});_focusMonitor=g(Ct$1);_ngZone=g(ne);_injector=g(fe);_scrollStrategy=g(Ot);_changeDetectorRef=g(oC);_animationsDisabled=j();_portal;_overlayRef=null;_menuOpen=!1;_closingActionsSubscription=X.EMPTY;_menuCloseSubscription=X.EMPTY;_pendingRemoval;_parentMaterialMenu;_parentInnerPadding;_openedBy=void 0;get _menu(){return this._menuInternal}set _menu(e){e!==this._menuInternal&&(this._menuInternal=e,this._menuCloseSubscription.unsubscribe(),e?(this._parentMaterialMenu,this._menuCloseSubscription=e.close.subscribe(t=>{this._destroyMenu(t),(t===`click`||t===`tab`)&&this._parentMaterialMenu&&this._parentMaterialMenu.closed.emit(t)})):this._destroyMenu(),this._menuItemInstance?._setTriggersSubmenu(this._triggersSubmenu()))}_menuInternal=null;constructor(e){this._canHaveBackdrop=e;let t=g(oe,{optional:!0});this._parentMaterialMenu=t instanceof x?t:void 0}ngOnDestroy(){this._menu&&this._ownsMenu(this._menu)&&y.delete(this._menu),this._pendingRemoval?.unsubscribe(),this._menuCloseSubscription.unsubscribe(),this._closingActionsSubscription.unsubscribe(),this._overlayRef&&(this._overlayRef.dispose(),this._overlayRef=null)}get menuOpen(){return this._menuOpen}get dir(){return this._dir&&this._dir.value===`rtl`?`rtl`:`ltr`}_triggersSubmenu(){return!!(this._menuItemInstance&&this._parentMaterialMenu&&this._menu)}_closeMenu(){this._menu?.close.emit()}_openMenu(e){if(this._triggerIsAriaDisabled())return;let t=this._menu;if(this._menuOpen||!t)return;this._pendingRemoval?.unsubscribe();let n=y.get(t);y.set(t,this),n&&n!==this&&n._closeMenu();let a=this._createOverlay(t),o=a.getConfig(),g=o.positionStrategy;this._setPosition(t,g),this._canHaveBackdrop?o.hasBackdrop=t.hasBackdrop==null?!this._triggersSubmenu():t.hasBackdrop:o.hasBackdrop=t.hasBackdrop??!1,a.hasAttached()||(a.attach(this._getPortal(t)),t.lazyContent?.attach(this.menuData)),this._closingActionsSubscription=this._menuClosingActions().subscribe(()=>this._closeMenu()),t.parentMenu=this._triggersSubmenu()?this._parentMaterialMenu:void 0,t.direction=this.dir,e&&t.focusFirstItem(this._openedBy||`program`),this._setIsMenuOpen(!0),t instanceof x&&(t._setIsOpen(!0),t._directDescendantItems.changes.pipe(Om(t.close)).subscribe(()=>{g.withLockedPosition(!1).reapplyLastPosition(),g.withLockedPosition(!0)}))}focus(e,t){this._focusMonitor&&e?this._focusMonitor.focusVia(this._element,e,t):this._element.nativeElement.focus(t)}_destroyMenu(e){let t=this._overlayRef,n=this._menu;!t||!this.menuOpen||(this._closingActionsSubscription.unsubscribe(),this._pendingRemoval?.unsubscribe(),n instanceof x&&this._ownsMenu(n)?(this._pendingRemoval=n._animationDone.pipe(wn(1)).subscribe(()=>{t.detach(),y.has(n)||n.lazyContent?.detach()}),n._setIsOpen(!1)):(t.detach(),n?.lazyContent?.detach()),n&&this._ownsMenu(n)&&y.delete(n),this.restoreFocus&&(e===`keydown`||!this._openedBy||!this._triggersSubmenu())&&this.focus(this._openedBy),this._openedBy=void 0,this._setIsMenuOpen(!1))}_setIsMenuOpen(e){e!==this._menuOpen&&(this._menuOpen=e,this._menuOpen?this.menuOpened.emit():this.menuClosed.emit(),this._triggersSubmenu()&&this._menuItemInstance._setHighlighted(e),this._changeDetectorRef.markForCheck())}_createOverlay(e){if(!this._overlayRef){let t=this._getOverlayConfig(e);this._subscribeToPositions(e,t.positionStrategy),this._overlayRef=Dt(this._injector,t),this._overlayRef.keydownEvents().subscribe(n=>{this._menu instanceof x&&this._menu._handleKeydown(n)})}return this._overlayRef}_getOverlayConfig(e){return new X$1({positionStrategy:Et$1(this._injector,this._getOverlayOrigin()).withLockedPosition().withGrowAfterOpen().withTransformOriginOn(`.mat-menu-panel, .mat-mdc-menu-panel`),backdropClass:e.backdropClass||`cdk-overlay-transparent-backdrop`,panelClass:e.overlayPanelClass,scrollStrategy:this._scrollStrategy(),direction:this._dir||`ltr`,disableAnimations:this._animationsDisabled})}_subscribeToPositions(e,t){e.setPositionClasses&&t.positionChanges.subscribe(n=>{this._ngZone.run(()=>{let a=n.connectionPair.overlayX===`start`?`after`:`before`,o=n.connectionPair.overlayY===`top`?`below`:`above`;e.setPositionClasses(a,o)})})}_setPosition(e,t){let[n,a]=e.xPosition===`before`?[`end`,`start`]:[`start`,`end`],[o,g]=e.yPosition===`above`?[`bottom`,`top`]:[`top`,`bottom`],[W,Q]=[o,g],[K,q]=[n,a],C=0;if(this._triggersSubmenu()){if(q=n=e.xPosition===`before`?`start`:`end`,a=K=n===`end`?`start`:`end`,this._parentMaterialMenu){if(this._parentInnerPadding==null){let re=this._parentMaterialMenu.items.first;this._parentInnerPadding=re?re._getHostElement().offsetTop:0}C=o===`bottom`?this._parentInnerPadding:-this._parentInnerPadding}}else e.overlapTrigger||(W=o===`top`?`bottom`:`top`,Q=g===`top`?`bottom`:`top`);t.withPositions([{originX:n,originY:W,overlayX:K,overlayY:o,offsetY:C},{originX:a,originY:W,overlayX:q,overlayY:o,offsetY:C},{originX:n,originY:Q,overlayX:K,overlayY:g,offsetY:-C},{originX:a,originY:Q,overlayX:q,overlayY:g,offsetY:-C}])}_menuClosingActions(){let e=this._getOutsideClickStream(this._overlayRef),t=this._overlayRef.detachments();return bm(e,this._parentMaterialMenu?this._parentMaterialMenu.closed:Fs(),this._parentMaterialMenu?this._parentMaterialMenu._hovered().pipe(Lt(o=>this._menuOpen&&o!==this._menuItemInstance)):Fs(),t)}_getPortal(e){return(!this._portal||this._portal.templateRef!==e.templateRef)&&(this._portal=new Y$1(e.templateRef,this._viewContainerRef)),this._portal}_ownsMenu(e){return y.get(e)===this}_triggerIsAriaDisabled(){return h1(this._element.nativeElement.getAttribute(`aria-disabled`))}static ɵfac=function(t){_E()};static ɵdir=vu({type:i})}return i})();var dt=(()=>{class i extends It{_cleanupTouchstart;_hoverSubscription=X.EMPTY;get _deprecatedMatMenuTriggerFor(){return this.menu}set _deprecatedMatMenuTriggerFor(e){this.menu=e}get menu(){return this._menu}set menu(e){this._menu=e}menuData;restoreFocus=!0;menuOpened=new qe;onMenuOpen=this.menuOpened;menuClosed=new qe;onMenuClose=this.menuClosed;constructor(){super(!0);let e=g(ki);this._cleanupTouchstart=e.listen(this._element.nativeElement,`touchstart`,t=>{G(t)||(this._openedBy=`touch`)},{passive:!0})}triggersSubmenu(){return super._triggersSubmenu()}toggleMenu(){return this.menuOpen?this.closeMenu():this.openMenu()}openMenu(){this._openMenu(!0)}closeMenu(){this._closeMenu()}updatePosition(){this._overlayRef?.updatePosition()}ngAfterContentInit(){this._handleHover()}ngOnDestroy(){super.ngOnDestroy(),this._cleanupTouchstart(),this._hoverSubscription.unsubscribe()}_getOverlayOrigin(){return this._element}_getOutsideClickStream(e){return e.backdropClick()}_handleMousedown(e){Z(e)||(this._openedBy=e.button===0?`mouse`:void 0,this.triggersSubmenu()&&e.preventDefault())}_handleKeydown(e){let t=e.keyCode;(t===13||t===32)&&(this._openedBy=`keyboard`),this.triggersSubmenu()&&(t===39&&this.dir===`ltr`||t===37&&this.dir===`rtl`)&&(this._openedBy=`keyboard`,this.openMenu())}_handleClick(e){this.triggersSubmenu()?(e.stopPropagation(),this.openMenu()):this.toggleMenu()}_handleHover(){this.triggersSubmenu()&&this._parentMaterialMenu&&(this._hoverSubscription=this._parentMaterialMenu._hovered().subscribe(e=>{e===this._menuItemInstance&&!e.disabled&&this._parentMaterialMenu?._panelAnimationState!==`void`&&(this._openedBy=`mouse`,this._openMenu(!1))}))}static ɵfac=function(t){return new(t||i)};static ɵdir=vu({type:i,selectors:[[``,`mat-menu-trigger-for`,``],[``,`matMenuTriggerFor`,``]],hostAttrs:[1,`mat-mdc-menu-trigger`],hostVars:3,hostBindings:function(t,n){t&1&&Ph(`click`,function(o){return n._handleClick(o)})(`mousedown`,function(o){return n._handleMousedown(o)})(`keydown`,function(o){return n._handleKeydown(o)}),t&2&&xh(`aria-haspopup`,n.menu?`menu`:null)(`aria-expanded`,n.menuOpen)(`aria-controls`,n.menuOpen?n.menu?.panelId:null)},inputs:{_deprecatedMatMenuTriggerFor:[0,`mat-menu-trigger-for`,`_deprecatedMatMenuTriggerFor`],menu:[0,`matMenuTriggerFor`,`menu`],menuData:[0,`matMenuTriggerData`,`menuData`],restoreFocus:[0,`matMenuTriggerRestoreFocus`,`restoreFocus`]},outputs:{menuOpened:`menuOpened`,onMenuOpen:`onMenuOpen`,menuClosed:`menuClosed`,onMenuClose:`onMenuClose`},exportAs:[`matMenuTrigger`],features:[Ch]})}return i})();var pt=(()=>{class i{static ɵfac=function(t){return new(t||i)};static ɵmod=ss({type:i});static ɵinj=Ir({imports:[an,me,Nt$1,vt]})}return i})();var Tt=(i,d)=>d.path;function Rt(i,d){if(i&1){let e=BI();Wi(0,`button`,20),Ph(`click`,function(){md(e);return yd(UI().open.set(!1))}),bu()}}function Nt(i,d){if(i&1){let e=BI();Wi(0,`a`,22),Ph(`click`,function(){md(e);return yd(UI(2).open.set(!1))}),Wi(1,`mat-icon`),vw(2),bu(),vw(3),bu()}if(i&2){let e=UI().$implicit;Ah(`routerLink`,`/`+e.path),ND(2),Xh(e.icon),ND(),Xh(e.label)}}function Et(i,d){if(i&1&&xI(0,Nt,4,3,`a`,21),i&2){let e=d.$implicit;AI(UI().state.has(e.permission)?0:-1)}}var gt=class i$1{state=g(i);auth=g(u);brand=a;open=gi(!1);navigation=[{path:`dashboard`,label:`Vista general`,icon:`space_dashboard`,permission:`reports.view`},{path:`customers`,label:`Clientes`,icon:`people_outline`,permission:`customers.view`},{path:`products`,label:`Productos`,icon:`inventory_2`,permission:`products.view`},{path:`inventory`,label:`Inventario`,icon:`layers`,permission:`inventory.view`},{path:`sales`,label:`Ventas`,icon:`shopping_bag`,permission:`sales.view`},{path:`quotes`,label:`Presupuestos`,icon:`description`,permission:`quotes.view`},{path:`accounts-receivable`,label:`Cuentas por cobrar`,icon:`account_balance_wallet`,permission:`payments.view`},{path:`payments`,label:`Pagos`,icon:`payments`,permission:`payments.view`},{path:`users`,label:`Equipo y accesos`,icon:`group_add`,permission:`users.view`},{path:`settings`,label:`Configuración`,icon:`settings`,permission:`settings.view`}];static ɵfac=function(e){return new(e||i$1)};static ɵcmp=cI({type:i$1,selectors:[[`app-layout`]],decls:54,vars:14,consts:[[`profile`,`matMenu`],[`aria-label`,`Cerrar menú`,1,`scrim`],[`routerLink`,`/dashboard`,1,`brand`],[`alt`,``,3,`src`],[1,`business`],[1,`business-icon`],[1,`nav-label`],[`aria-label`,`Navegación principal`],[1,`sidebar-footer`],[1,`live-dot`],[1,`workspace`],[1,`topbar`],[1,`actions`],[`mat-icon-button`,``,`aria-label`,`Abrir menú`,1,`mobile-toggle`,3,`click`],[1,`workspace-label`],[1,`business-country`],[`mat-button`,``,3,`matMenuTriggerFor`],[1,`avatar`],[`mat-menu-item`,``,`disabled`,``],[`mat-menu-item`,``,3,`click`],[`aria-label`,`Cerrar menú`,1,`scrim`,3,`click`],[`routerLinkActive`,`active`,3,`routerLink`],[`routerLinkActive`,`active`,3,`click`,`routerLink`]],template:function(e,t){if(e&1&&(xI(0,Rt,1,0,`button`,1),Wi(1,`aside`)(2,`a`,2),Rh(3,`img`,3),vw(4),Wi(5,`span`),vw(6,`WORKSPACE`),bu()(),Wi(7,`div`,4)(8,`span`,5),vw(9),bu(),Wi(10,`div`)(11,`strong`),vw(12),bu(),Wi(13,`small`),vw(14,`Mi empresa`),bu()(),Wi(15,`mat-icon`),vw(16,`unfold_more`),bu()(),Wi(17,`span`,6),vw(18,`PRINCIPAL`),bu(),Wi(19,`nav`,7),OI(20,Et,1,1,null,null,Tt),bu(),Wi(22,`div`,8),Rh(23,`span`,9),vw(24,` Todo listo para crecer`),Wi(25,`small`),vw(26),bu()()(),Wi(27,`div`,10)(28,`header`,11)(29,`div`,12)(30,`button`,13),Ph(`click`,function(){return t.open.set(!0)}),Wi(31,`mat-icon`),vw(32,`menu`),bu()(),Wi(33,`span`,14),vw(34,`Mi espacio de trabajo`),bu()(),Wi(35,`div`,12)(36,`span`,15),vw(37),bu(),Wi(38,`button`,16)(39,`span`,17),vw(40),bu(),vw(41),Wi(42,`mat-icon`),vw(43,`expand_more`),bu()(),Wi(44,`mat-menu`,null,0)(46,`button`,18),vw(47),bu(),Wi(48,`button`,19),Ph(`click`,function(){return t.auth.logout()}),vw(49,`Cerrar sesión`),bu()()()(),Wi(50,`main`),Rh(51,`router-outlet`),bu(),Wi(52,`footer`),vw(53),bu()()),e&2){let n=QI(45);AI(t.open()?0:-1),ND(),Wh(`open`,t.open()),ND(2),Ah(`src`,t.brand.applicationLogo,yp),ND(),Xh(t.brand.applicationName),ND(5),Xh(t.state.currentBusiness()?.name?.slice(0,1)),ND(3),Xh(t.state.currentBusiness()?.name),ND(8),kI(t.navigation),ND(6),Su(`Versión `,t.brand.version),ND(11),Xh(t.state.currentBusiness()?.currency),ND(),Ah(`matMenuTriggerFor`,n),ND(2),Xh(t.state.currentUser()?.firstName?.slice(0,1)),ND(),Su(` `,t.state.currentUser()?.firstName,` `),ND(6),Xh(t.state.currentUser()?.email),ND(6),Su(``,t.brand.applicationName,` · Un negocio organizado, un paso adelante.`)}},dependencies:[Tt$1,bo,ur,yt$1,wt$1,rr,ir,Vn,pt,x,N,dt],styles:[`[_nghost-%COMP%]{display:block}aside[_ngcontent-%COMP%]{position:fixed;inset:0 auto 0 0;width:250px;background:var(--%NS%surface);border-right:1px solid var(--%NS%border);padding:30px 18px;display:flex;flex-direction:column;z-index:20}.brand[_ngcontent-%COMP%]{display:flex;align-items:center;gap:9px;font-size:27px;font-weight:800;padding:0 10px 30px}.brand[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:35px}.brand[_ngcontent-%COMP%] > span[_ngcontent-%COMP%]{font-size:7px;letter-spacing:1px;background:var(--%NS%brand-soft);padding:5px;border-radius:4px;margin-left:auto}.business[_ngcontent-%COMP%]{display:flex;align-items:center;gap:10px;border:1px solid var(--%NS%border);border-radius:10px;padding:12px;margin-bottom:28px}.business[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%]{font-size:12px;display:block;max-width:125px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.business[_ngcontent-%COMP%]   small[_ngcontent-%COMP%]{font-size:10px;color:var(--%NS%muted)}.business[_ngcontent-%COMP%] > mat-icon[_ngcontent-%COMP%]{font-size:16px;width:16px;margin-left:auto}.business-icon[_ngcontent-%COMP%], .avatar[_ngcontent-%COMP%]{display:inline-grid;place-items:center;width:30px;height:30px;background:var(--%NS%brand-soft);color:var(--%NS%brand);border-radius:9px;font-weight:700}.nav-label[_ngcontent-%COMP%]{font-size:9px;letter-spacing:1.4px;color:var(--%NS%muted);padding:0 14px 12px}nav[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:4px}nav[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:8px;font-size:12px;color:var(--%NS%muted);font-weight:500}nav[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{font-size:19px;width:19px;height:19px}nav[_ngcontent-%COMP%]   a.active[_ngcontent-%COMP%]{background:var(--%NS%brand-soft);color:var(--%NS%brand);font-weight:700}.sidebar-footer[_ngcontent-%COMP%]{margin-top:auto;padding:26px 12px 0;font-size:10px;color:var(--%NS%muted)}.sidebar-footer[_ngcontent-%COMP%]   small[_ngcontent-%COMP%]{display:block;margin:10px 0 0 13px;font-size:9px}.live-dot[_ngcontent-%COMP%]{display:inline-block;width:6px;height:6px;background:var(--%NS%brand);border-radius:50%;margin-right:7px}.workspace[_ngcontent-%COMP%]{margin-left:250px}.topbar[_ngcontent-%COMP%]{height:77px;border-bottom:1px solid var(--%NS%border);background:var(--%NS%surface);display:flex;align-items:center;justify-content:space-between;padding:0 34px}.workspace-label[_ngcontent-%COMP%]{font-size:12px;color:var(--%NS%muted)}.business-country[_ngcontent-%COMP%]{font-size:10px;padding:5px 9px;border:1px solid var(--%NS%border);border-radius:5px}.avatar[_ngcontent-%COMP%]{width:26px;height:26px;font-size:11px}.topbar[_ngcontent-%COMP%]   .mobile-toggle[_ngcontent-%COMP%]{display:none}main[_ngcontent-%COMP%]{padding:36px;max-width:1550px;margin:auto}footer[_ngcontent-%COMP%]{padding:20px 36px;font-size:10px;color:var(--%NS%muted)}.scrim[_ngcontent-%COMP%]{position:fixed;inset:0;background:#0005;border:0;z-index:19}@media(max-width:1000px){aside[_ngcontent-%COMP%]{transform:translate(-100%);transition:transform .2s}aside.open[_ngcontent-%COMP%]{transform:translate(0)}.workspace[_ngcontent-%COMP%]{margin-left:0}.topbar[_ngcontent-%COMP%]   .mobile-toggle[_ngcontent-%COMP%]{display:inline-flex}}@media(max-width:700px){main[_ngcontent-%COMP%]{padding:24px 16px}.topbar[_ngcontent-%COMP%]{padding:0 16px}.workspace-label[_ngcontent-%COMP%]{display:none}}aside[_ngcontent-%COMP%]{background:linear-gradient(165deg,#152440,#101a30);border-right:0;box-shadow:6px 0 28px #15244012}aside[_ngcontent-%COMP%]   .brand[_ngcontent-%COMP%]{color:#fff}aside[_ngcontent-%COMP%]   .brand[_ngcontent-%COMP%] > span[_ngcontent-%COMP%]{background:#ffffff14;color:#b9c9ff}aside[_ngcontent-%COMP%]   .business[_ngcontent-%COMP%]{background:#ffffff08;border-color:#ffffff18;color:#fff}aside[_ngcontent-%COMP%]   .business[_ngcontent-%COMP%]   small[_ngcontent-%COMP%], aside[_ngcontent-%COMP%]   .nav-label[_ngcontent-%COMP%], aside[_ngcontent-%COMP%]   .sidebar-footer[_ngcontent-%COMP%]{color:#9caecb}aside[_ngcontent-%COMP%]   nav[_ngcontent-%COMP%]{gap:6px}aside[_ngcontent-%COMP%]   nav[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:#b8c6df;padding:12px 14px;font-size:13px;transition:background .15s,color .15s}aside[_ngcontent-%COMP%]   nav[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover{background:#ffffff0d;color:#fff}aside[_ngcontent-%COMP%]   nav[_ngcontent-%COMP%]   a.active[_ngcontent-%COMP%]{background:#3659d9;color:#fff;box-shadow:0 4px 14px #0002}aside[_ngcontent-%COMP%]   .business-icon[_ngcontent-%COMP%]{background:#ffffff14;color:#c4d0ff}.topbar[_ngcontent-%COMP%]{background:#ffffffeb;box-shadow:0 2px 12px #17243b04}`]})};export{gt as AppLayoutComponent};