using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using System.Windows.Automation;

namespace DentrixAutomation
{
    class WinAutomate
    {
        static void Main(string[] args)
        {
            Say(DateTime.Now.ToLongTimeString(), "started");
            AppDomain.CurrentDomain.UnhandledException += new UnhandledExceptionEventHandler(OnUnhandledException);
            CliHandler();
        }

        static void OnUnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            Say((e.ExceptionObject as Exception).Message, "error");
        }

        static void CliHandler()
        {
            DentAutomator automator = new DentAutomator();
            string commandRaw = null, action = null;

            do
            {
                commandRaw = Console.ReadLine();
                string[] payload = commandRaw.Split(';');
                for(int i = 0; i < payload.Length; i++)
                {
                    payload[i] = payload[i].Trim();
                }
                action = payload[0];

                try
                {
                    switch (action)
                    {
                        case "i":
                        case "interactive":
                            automator.RunInteractiveLookup();
                            break;
                        case "q":
                        case "exit":
                            Say("Quit", "exit");
                            Environment.Exit(0);
                            break;
                        case "focus":
                            if (payload.Length == 2) {
                                // focus to another app
                                automator.FocusNamedWindow(payload[1]);
                            }
                            else
                            {
                                // focus dentrix
                                automator.BringToFront(true);
                            }
                            Say("ok", "data");
                            break;
                        case "hide":
                            // hide dentrix
                            automator.Minimize();
                            Say("ok", "data");
                            break;
                        case "search":
                            automator.GetDent().PrepareSearchForm();
                            int found = automator.SearchPatientsCountByName(payload[1]);
                            Say(found.ToString(), "data");
                            break;
                        case "current":
                            Say(automator.GetDent().CurrentClientName(), "data");
                            break;
                        case "payment":
                            if (payload.Length == 5)
                            {
                                automator.GetDent().PreparePaymentForm();
                                automator.EnterAmount(payload[1], payload[2], payload[3], payload[4], true);
                                Say("ok", "data");
                            }
                            else
                            {
                                Say("Payment arguments: amount; order ref; note; payment method", "error");
                            }
                            break;
                        default:
                            InvalidInputWarning();
                            break;
                    }
                }
                catch (Exception e)
                {
                    Say(e.Message, "error");
#if DEBUG
                    Console.WriteLine(e.StackTrace);
#endif
                }
            } while (true);

        }

        public static void InvalidInputWarning()
        {
            Say("Unknown command.", "error");
        }

        public static void Say(String message, String code = "info")
        {
            if (code == "data") {
                message = '>' + message + '<';
            }
            Console.WriteLine("[{0}] {1}", code, message);
        }
    }

    class DentAutomator
    {
        AutomationElement ledgerWindow, paymentForm, searchForm;
        const string classNameWindowLedger = "Mledger";
        const string aidWindowPayment = "PaymentForm";
        const string aidWindowSelectPatient = "SelectPatientForm";
        const string aidWindowSelectOk = "okButton";
        const string aidInputPatientName = "searchByNonMask";
        const string aidSearchResultContainer = "dtxPatientGrid";
        const string aidSearchResultTBody = "ultraGrid";

        public void RunInteractiveLookup()
        {
            DateTime start = DateTime.Now;
            FindMainWindow();

            Console.WriteLine("Enter patient's Last Name, First name:");
            String patientName = Console.ReadLine();
            PrepareSearchForm();
            int patientsN = SearchPatientsCountByName(patientName);

            if (patientsN == 1)
            {
                InvokeFormButton(searchForm, aidWindowSelectOk);
            }
            else
            {
                Console.WriteLine("Found {0} patients. Select patient at Ledger and press Enter here", patientsN);
                Console.ReadLine();
            }

            Console.WriteLine("Input payment amount, ex. 12.00:");
            String amount = Console.ReadLine();

            Console.WriteLine("Input transaction number, ex. order-01:");
            String number = Console.ReadLine();

            PreparePaymentForm();
            EnterAmount(amount, number, "via OfficeSafe-Pay. Transaction ref. 000-00000-00-0000");

            Console.WriteLine("Automation completed. Time taken: {0} s.", (DateTime.Now - start).TotalSeconds);
            Console.ReadLine();
        }

        public void PrepareSearchForm()
        {
            searchForm = FindChildWindow(aidWindowSelectPatient);
            if (null == searchForm)
            {
                if (OpenNestedMenu(ledgerWindow,
                    new PropertyCondition(AutomationElement.AccessKeyProperty, "Alt+F"),
                    new PropertyCondition(AutomationElement.AutomationIdProperty, "Item 213")
                ))
                {
                    searchForm = WaitForChildWindow(aidWindowSelectPatient, 2, 1000);
                }
                if (null == searchForm)
                {
                    WaitShort();
                    SendKeys.SendWait("{F2}");
                    searchForm = WaitForChildWindow(aidWindowSelectPatient, 2, 1000);
                }
            }

            var searchControlPanel = GetChildrenChain(searchForm, new[] {
                new PropertyCondition(AutomationElement.AutomationIdProperty, "SelectPatientForm_Fill_Panel"),
                new PropertyCondition(AutomationElement.AutomationIdProperty, "ultraTabControl1"),
                new PropertyCondition(AutomationElement.AutomationIdProperty, "SearchByTabPage"),
                new PropertyCondition(AutomationElement.AutomationIdProperty, "UltraOptionSet"),
            });

            // optional setup: tab "Search By" and radio "Last, First"
            // due bug with results cleanup we need to click any other radio
            // and then pick desired
            TryClickNamedRadio(searchControlPanel, "&Preferred Name");
            WaitShort();
            TryClickNamedRadio(searchControlPanel, "L&ast Name (Last, First)");
        }

        public void PreparePaymentForm()
        {
            paymentForm = FindChildWindow(aidWindowPayment);
            if (null == paymentForm)
            {
                if (OpenNestedMenu(ledgerWindow,
                    new PropertyCondition(AutomationElement.NameProperty, "Transaction"),
                    new PropertyCondition(AutomationElement.AutomationIdProperty, "Item 280")
                ))
                {
                    paymentForm = WaitForChildWindow(aidWindowPayment);
                }
                if (null == paymentForm)
                {
                    throw new Exception("Please open 'Menu > Transaction > Enter Payment'");
                }
            }
        }

        public void WaitShort()
        {
            Thread.Sleep(150);
        }

        public void WaitLong()
        {
            Thread.Sleep(1200);
        }

        public void TryClickNamedRadio(AutomationElement container, String radioName)
        {
            var radio = container.FindFirst(TreeScope.Descendants,
                    new AndCondition(
                        new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.RadioButton),
                        new PropertyCondition(AutomationElement.NameProperty, radioName)
                    )
                );
            if (radio != null)
            {
                (radio.GetCurrentPattern(InvokePattern.Pattern) as InvokePattern).Invoke();
            }
        }

        public AutomationElement GetChildrenChain(AutomationElement initialRoot, Condition[] chainway)
        {
            AutomationElement root = initialRoot;
            foreach (Condition condition in chainway)
            {
                root = root.FindFirst(TreeScope.Children, condition);
                if (root == null)
                {
                    return null;
                }
            }
            return root;
        }

        public bool OpenNestedMenu(AutomationElement window, Condition rootExpandableMenu, Condition targetInvokableMenu)
        {
            // find root
            var menuRoot = window.FindFirst(
                TreeScope.Descendants,

            new AndCondition(
                new PropertyCondition(AutomationElement.ControlTypeProperty, ControlType.MenuItem),
                rootExpandableMenu
            )
            );
            // null check
            if (menuRoot == null)
            {
                return false;
            }
            // expand
            (menuRoot.GetCurrentPattern(ExpandCollapsePattern.Pattern) as ExpandCollapsePattern).Expand();
            // find child
            var menuItem = menuRoot.FindFirst(
                TreeScope.Subtree,
                targetInvokableMenu
            );
            // null check
            if (menuItem == null)
            {
                return false;
            }
            // invoke
            (menuItem.GetCurrentPattern(InvokePattern.Pattern) as InvokePattern).Invoke();
            return true;
        }

        public bool FocusNamedWindow(string nameMask)
        {
            nameMask = nameMask.Trim().ToLower();
            var windows = AutomationElement.RootElement.FindAll(TreeScope.Children, Condition.TrueCondition);
            foreach (AutomationElement window in windows)
            {
                string windowName = window.Current.Name;
#if DEBUG
                Console.WriteLine("\t{0}", windowName);
#endif
                if (windowName.ToLower().IndexOf(nameMask) >= 0)
                {
                    window.SetWindowState(WindowVisualState.Normal, true);
                    return true;
                }
            }
            return false;
        }

        public DentAutomator GetDent()
        {
            BringToFront();
            return this;
        }

        public void BringToFront(bool focus = false)
        {
            FindMainWindow();
            ledgerWindow.SetWindowState(WindowVisualState.Normal, focus);
        }

        public void Minimize()
        {
            FindMainWindow();
            ledgerWindow.SetWindowState(WindowVisualState.Minimized);
        }

        public void FindMainWindow()
        {
            var windows = AutomationElement.RootElement.FindAll(TreeScope.Children, Condition.TrueCondition);
            foreach (AutomationElement window in windows)
            {
                if (window.Current.ClassName.Equals(classNameWindowLedger))
                {
                    ledgerWindow = window;
                }
            }

            if (null == ledgerWindow)
            {
                throw new Exception("Ledger window not found - is application running?");
            }

        }

        /*
         * Return current client name based on Ledger window title
         */
        public string CurrentClientName()
        {
            string[] parts = ledgerWindow.Current.Name.Split(new[] { '-' }, 2);
            return parts.Length == 2 ? parts[1].Trim() : "";
        }

        public AutomationElement WaitForChildWindow(String aidTarget, int retries = 3, int delay = 500)
        {
            AutomationElement w = null;
            do
            {
                Thread.Sleep(delay);
                w = FindChildWindow(aidTarget);
                if (null != w)
                {
                    break;
                }
            } while (retries-- > 0);

            return w;
        }

        public AutomationElement FindChildWindow(String aidTarget)
        {
            AutomationElement target = ledgerWindow.FindFirst(
                TreeScope.Children,
                new PropertyCondition(AutomationElement.AutomationIdProperty, aidTarget)
             );

            return target;
        }

        public int SearchPatientsCountByName(string name)
        {
            var searchControlPanel = GetChildrenChain(searchForm, new[] {
                new PropertyCondition(AutomationElement.AutomationIdProperty, "SelectPatientForm_Fill_Panel"),
                new PropertyCondition(AutomationElement.AutomationIdProperty, "ultraTabControl1"),
                new PropertyCondition(AutomationElement.AutomationIdProperty, "SearchByTabPage"),
            });

            if (searchControlPanel == null)
            {
                throw new Exception("Search patient: search form not found");
            }

            // results container
            var resultsContainer = searchControlPanel.FindFirst(
                TreeScope.Descendants,
                new PropertyCondition(AutomationElement.AutomationIdProperty, aidSearchResultContainer)
            );

            if (resultsContainer == null)
            {
                throw new Exception("Search patient: form table not found");
            }

            // input field
            var searchInput = searchControlPanel.FindFirst(
                TreeScope.Descendants,
                new PropertyCondition(AutomationElement.AutomationIdProperty, aidInputPatientName)
            );

            if (searchInput == null)
            {
                throw new Exception("Search patient: name input box not found");
            }

            // set value
            searchInput.DoSetValue(name);
            // wait for results
            WaitLong();

            // count results - find rows count inside container
            var resultRowsHolder = resultsContainer.FindFirst(
                TreeScope.Descendants,
                new PropertyCondition(AutomationElement.AutomationIdProperty, aidSearchResultTBody)
            );

            if (resultRowsHolder != null)
            {
                // find direct children = rows
                var resultRows = resultRowsHolder.FindAll(
                    TreeScope.Children,
                    new PropertyCondition(AutomationElement.IsEnabledProperty, true)
                );
                int count = 0;
                foreach (AutomationElement row in resultRows)
                {
                    if (row.Current.Name.StartsWith("EntityCollection"))
                    {
                        count++;
                    }
                }
                return count;
            }

            // nothing found
            return 0;
        }

        public void InvokeFormButton(AutomationElement form, string automationId)
        {
            var btn = form.TryFirstDescendant(automationId);
            btn.DoClick();
        }

        public void EnterAmount(string value, string orderNumber,
            string note = "via OfficeSafe-Pay", string paymentMask = "visa",
            bool autoCommit = false)
        {
            if (paymentForm == null)
                return;

            // find form elements
            var amountInput = paymentForm.TryNamedChain(new[] { "_paymentAmountControl", "_editCtrl" });
            var noteInput = paymentForm.TryNamedChain(new[] { "_noteTextBox", "_richTextBox" });
            var numberInput = paymentForm.TryNamedChain(new[] { "_checkNumberEditBox" });
            var okButton = paymentForm.TryNamedChain(new[] { "_btnOK" });

            // fill values
            amountInput.DoSetValue(value);
            numberInput.DoSetValue(orderNumber);
            noteInput.InsertTextUsingUIAutomation(note);

            // set payment type
            try
            {
                var paymentTypesList = paymentForm.TryNamedChain(new[] {
                "_paymentTypesListBox", "_objectListView" });
                var lines = paymentTypesList.FindAll(TreeScope.Children, Condition.TrueCondition);
                foreach(AutomationElement line in lines)
                {
                    string name = line.Current.Name.Trim().ToLower();
#if DEBUG
                    Console.WriteLine("> {0} \t {1}", name, line.Current.Name);
#endif
                    if (name.IndexOf(paymentMask) >= 0)
                    {
                        // try to select
                        (line.GetCurrentPattern(SelectionItemPattern.Pattern) as SelectionItemPattern).Select();
                        break;
                    }
                }
            } catch
            {
                // no op
            }

            if (autoCommit)
            {
                okButton.DoClick();
            }
        }
    }
}

public static class AutomationElementExtensions
{
    public static AutomationElement TryFirstDescendant(this AutomationElement root,
            AutomationProperty byProperty, object value,
            String throwOnNull = "Unable to find form element")
    {
        var element = root.FindFirst(TreeScope.Descendants, new PropertyCondition(byProperty, value));
        if (element == null && throwOnNull != null)
        {
            throw new Exception(throwOnNull);
        }

        return element;
    }

    public static AutomationElement TryFirstDescendant(this AutomationElement root,
        object automationIdValue)
    {
        return root.TryFirstDescendant(AutomationElement.AutomationIdProperty, automationIdValue,
            String.Format("Unable to find form element with automationId {0}", automationIdValue)
        );
    }

    public static AutomationElement TryNamedChain(this AutomationElement initialRoot,
        string[] automationIds)
    {
        AutomationElement root = initialRoot;
        foreach (String aid in automationIds)
        {
            root = root.FindFirst(TreeScope.Children, new PropertyCondition(AutomationElement.AutomationIdProperty, aid));
            if (root == null)
            {
                break;
            }
        }

        if (root == null)
        {
            throw new Exception("Unable to find element by automationId chain");
        }
        return root;
    }

    public static void DoClick(this AutomationElement element)
    {
        (element.GetCurrentPattern(InvokePattern.Pattern) as InvokePattern).Invoke();
    }

    public static void DoSetValue(this AutomationElement element, string value)
    {
        (element.GetCurrentPattern(ValuePattern.Pattern) as ValuePattern).SetValue(value);
    }

    public static bool SetWindowState(this AutomationElement window, WindowVisualState state, bool withFocus = false)
    {
        try
        {
            WindowPattern pattern = window.GetCurrentPattern(WindowPattern.Pattern) as WindowPattern;
            if (pattern.Current.WindowVisualState != state)
            {
                // try to unminimize
                pattern.SetWindowVisualState(state);
            }
            if (withFocus)
            {
                window.SetFocus();
            }
        }
        catch
        {
            return false;
        }
        return true;
    }

    // from https://docs.microsoft.com/en-us/dotnet/framework/ui-automation/add-content-to-a-text-box-using-ui-automation
    public static void InsertTextUsingUIAutomation(this AutomationElement element, string value)
    {
        try
        {
            // Validate arguments / initial setup
            if (value == null)
                throw new ArgumentNullException(
                    "String parameter must not be null.");

            if (element == null)
                throw new ArgumentNullException(
                    "AutomationElement parameter must not be null");

            // A series of basic checks prior to attempting an insertion.
            //
            // Check #1: Is control enabled?
            // An alternative to testing for static or read-only controls
            // is to filter using
            // PropertyCondition(AutomationElement.IsEnabledProperty, true)
            // and exclude all read-only text controls from the collection.
            if (!element.Current.IsEnabled)
            {
                throw new InvalidOperationException(
                    "The control with an AutomationID of "
                    + element.Current.AutomationId.ToString()
                    + " is not enabled.\n\n");
            }

            // Check #2: Are there styles that prohibit us
            //           from sending text to this control?
            if (!element.Current.IsKeyboardFocusable)
            {
                throw new InvalidOperationException(
                    "The control with an AutomationID of "
                    + element.Current.AutomationId.ToString()
                    + "is read-only.\n\n");
            }

            // Once you have an instance of an AutomationElement,
            // check if it supports the ValuePattern pattern.
            object valuePattern = null;

            // Control does not support the ValuePattern pattern
            // so use keyboard input to insert content.
            //
            // NOTE: Elements that support TextPattern
            //       do not support ValuePattern and TextPattern
            //       does not support setting the text of
            //       multi-line edit or document controls.
            //       For this reason, text input must be simulated
            //       using one of the following methods.
            //
            if (!element.TryGetCurrentPattern(
                ValuePattern.Pattern, out valuePattern))
            {
                // Set focus for input functionality and begin.
                element.SetFocus();

                // Pause before sending keyboard input.
                Thread.Sleep(100);

                // Delete existing content in the control and insert new content.
                SendKeys.SendWait("^{HOME}");   // Move to start of control
                SendKeys.SendWait("^+{END}");   // Select everything
                SendKeys.SendWait("{DEL}");     // Delete selection
                SendKeys.SendWait(value);
            }
            // Control supports the ValuePattern pattern so we can
            // use the SetValue method to insert content.
            else
            {
                // Set focus for input functionality and begin.
                element.SetFocus();

                ((ValuePattern)valuePattern).SetValue(value);
            }
        }
        catch (Exception exc)
        {
            throw exc;
        }

    }
}
