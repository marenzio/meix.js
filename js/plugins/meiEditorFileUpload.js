(function ($)
{
    window.meiEditorPlugins.push((function()
    {
        var retval = 
        {
            divName: "file-upload",
            title: 'Files',
            dropdownOptions: 
            {
                'Upload a file...': '$("#fileLoadModal").modal();',
                'Save a file...': '$("#fileSaveModal").modal();',
            },
            minimizedAppearance: '',
            init: function(meiEditor, meiEditorSettings)
            {
                //$.extend(meiEditorSettings, {});

                /*
                    Prompts local download of a page.
                    @param pageName The page to download.
                */
                var savePageToClient = function(pageName)
                {
                    formatToSave = function(lineIn, indexIn)
                    {          
                        if(lineIn !== "") //if the line's not blank (nothing in MEI should be)
                        {
                            formattedData[indexIn] = lineIn + "\n"; //add a newline - it doesn't use them otherwise. Last line will have a newline but this won't stack when pages are re-uploaded as this also removes blank lines.
                        }
                    }
                    
                    var formattedData = [];
                    var lastRow = meiEditorSettings.pageData[pageName].getSession().doc.getLength() - 1; //0-indexed
                    meiEditorSettings.pageData[pageName].getSession().doc.getLines(0, lastRow).forEach(formatToSave); //format each
                    var pageBlob = new Blob(formattedData, {type: "text/plain;charset=utf-8"}); //create a blob
                    saveAs(pageBlob, pageName); //download it! from FileSaver.js
                    $("#fileSaveModal-close").trigger('click');
                };

                /*
                    Adds the currently selected page of the fileLoadModal input to the database
                */
                var addPage = function()
                {
                    var reader = new FileReader();
                    reader.file = document.getElementById("fileInput").files[0];

                    //when the file is loaded as text
                    reader.onload = function(e) 
                    { 
                        fileNameOriginal = this.file.name;
                        fileNameStripped = meiEditor.stripFilenameForJQuery(fileNameOriginal); //this one strips spaces/periods so that it can be used as a jQuery selector

                        meiEditor.events.publish("NewFile", [this.result, fileNameStripped, fileNameOriginal])

                        //close the modal
                        $("#fileLoadModal-close").trigger('click');
                    };
                    reader.readAsText(reader.file);
                };

                meiEditor.createModal('fileLoadModal', true, '<input type="file" id="fileInput">', "Load file");
                meiEditor.createModal('fileSaveModal', true, meiEditor.createSelect("Save", meiEditorSettings.pageData), "Save file");
                $("#fileLoadModal-primary").on('click', addPage);
                $("#fileSaveModal-primary").on('click', function(){savePageToClient($("#selectSave").find(":selected").text());});

                meiEditor.events.subscribe("NewFile", function(a, b, fileNameOriginal)
                {
                    $("#selectSave").append("<option name='" + fileNameOriginal + "'>" + fileNameOriginal + "</option>");
                });
            }
        }
        return retval;
    })());
})(jQuery);