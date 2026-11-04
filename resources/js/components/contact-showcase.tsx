import { useState, type FormEvent } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export function ContactShowcase() {
    const { t } = useLang();
    const [lampIsOn, setLampIsOn] = useState(false);
    const [formIsOpen, setFormIsOpen] = useState(false);
    const [messageNoticeIsOpen, setMessageNoticeIsOpen] = useState(false);

    const closeContactDialog = () => {
        setFormIsOpen(false);
        setMessageNoticeIsOpen(false);
    };

    const toggleLamp = () => {
        setLampIsOn(!lampIsOn);
        if (lampIsOn) {
            closeContactDialog();
        }
    };

    const sendMessage = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormIsOpen(false);
        setMessageNoticeIsOpen(true);
    };

    return (
        <section id="kontak" className="contact-section" aria-labelledby="contact-title">
            <h2 id="contact-title" className="contact-title">
                {t('contact')}
            </h2>
            <p className="contact-hint">{t('contactLampHint')}</p>

            <div className="contact-light-stage">
                <button
                    type="button"
                    className={`bell-container${lampIsOn ? '' : ' off'}`}
                    aria-label={lampIsOn ? t('turnLampOff') : t('turnLampOn')}
                    aria-pressed={lampIsOn}
                    onClick={toggleLamp}
                >
                    <span className="rope" />
                    <span className="bell-top" />
                    <span className="bell-base" />
                    <span className="bell-base" />
                    <span className="shadow-l1" />
                    <span className="shadow-l2" />
                    <span className="left-glow" />
                    <span className="left-glow2" />
                    <span className="mid-ring" />
                    <span className="mid-ring small" />
                    <span className="glow" />
                    <span className="glow2" />
                    <span className="bell-buff-t" />
                    <span className="bell-buff" />
                    <span className="bell-btm" />
                    <span className="bell-btm2" />
                    <span className="bell-ring-container">
                        <span className="bell-ring" />
                        <span className="bell-rays" />
                    </span>
                    <span className="volumetric">
                        <span className="vl" />
                        <span className="vr" />
                    </span>
                </button>

                <button
                    type="button"
                    className={`contact-message-trigger button${lampIsOn ? ' is-visible' : ''}`}
                    tabIndex={lampIsOn ? 0 : -1}
                    aria-hidden={!lampIsOn}
                    onClick={() => setFormIsOpen((isOpen) => !isOpen)}
                >
                    {formIsOpen ? t('contactFormClose') : t('contactSendMessage')}
                </button>

                {(formIsOpen || messageNoticeIsOpen) && (
                    <button
                        type="button"
                        className="contact-form-backdrop"
                        aria-label={t('contactFormClose')}
                        onClick={closeContactDialog}
                    />
                )}

                <form
                    className={`contact-form${formIsOpen ? ' is-open' : ''}`}
                    aria-label={t('contactFormTitle')}
                    aria-hidden={!formIsOpen}
                    aria-modal={formIsOpen}
                    role="dialog"
                    onSubmit={sendMessage}
                >
                    <div className="contact-form-header">
                        <h3>{t('contactFormTitle')}</h3>
                        <button
                            className="contact-form-close"
                            type="button"
                            aria-label={t('contactFormClose')}
                            tabIndex={formIsOpen ? 0 : -1}
                            onClick={closeContactDialog}
                        >
                            <X aria-hidden="true" />
                        </button>
                    </div>
                    <label>
                        <span>{t('contactFormNameLabel')}</span>
                        <input autoComplete="name" name="name" required tabIndex={formIsOpen ? 0 : -1} />
                    </label>
                    <label>
                        <span>{t('contactFormEmailLabel')}</span>
                        <input autoComplete="email" name="email" type="email" required tabIndex={formIsOpen ? 0 : -1} />
                    </label>
                    <label>
                        <span>{t('contactFormSubjectLabel')}</span>
                        <input name="subject" required tabIndex={formIsOpen ? 0 : -1} />
                    </label>
                    <label>
                        <span>{t('contactFormMessageLabel')}</span>
                        <textarea name="message" rows={4} required tabIndex={formIsOpen ? 0 : -1} />
                    </label>
                    <button className="contact-form-submit" type="submit" tabIndex={formIsOpen ? 0 : -1}>
                        {t('contactFormSubmit')}
                        <ArrowUpRight aria-hidden="true" />
                    </button>
                </form>
                {messageNoticeIsOpen && (
                    <div
                        className="contact-form contact-notice is-open"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="contact-notice-title"
                        aria-describedby="contact-notice-message"
                    >
                        <div className="contact-form-header">
                            <h3 id="contact-notice-title">{t('contact')}</h3>
                            <button
                                className="contact-form-close"
                                type="button"
                                aria-label={t('contactFormClose')}
                                onClick={closeContactDialog}
                            >
                                <X aria-hidden="true" />
                            </button>
                        </div>
                        <p
                            id="contact-notice-message"
                            className="contact-notice-message"
                        >
                            {t('contactNoticeMessage')}
                        </p>
                        <button
                            className="contact-form-submit"
                            type="button"
                            onClick={closeContactDialog}
                        >
                            {t('close')}
                        </button>
                    </div>
                )}
                <div className="contact-grain" aria-hidden="true" />
            </div>
        </section>
    );
}
